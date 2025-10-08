'use client';
import chatIcon from '../../public/assets/images/chatIcon.png';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Image from "next/image";

interface ChatButtonProps {
  vendorEmail: string;
  vendorName: string;
  shopId?: number;
  shopName?: string;
  productId?: number;
  productName?: string;
  className?: string;
}

const ChatButton = ({ 
  vendorEmail, 
  vendorName, 
  shopId, 
  shopName, 
  productId, 
  productName, 
  className = '' 
}: ChatButtonProps) => {
  const { data: session } = useSession();
  const router = useRouter();

  const handleChatClick = () => {
    if (!session?.user?.email) {
      toast.error('Please login to start a chat');
      router.push('/login');
      return;
    }

    if (session.user.email === vendorEmail) {
      toast.error('You cannot chat with yourself');
      return;
    }

    // Navigate to chat page with vendor info
    const query = new URLSearchParams({
      vendor: vendorEmail,
      vendorName: vendorName
    });

    // Add optional parameters if provided
    if (shopId) query.append('shopId', shopId.toString());
    if (shopName) query.append('shopName', shopName);
    if (productId) query.append('productId', productId.toString());
    if (productName) query.append('productName', productName);
    
    router.push(`/chat?${query.toString()}`);
  };

  // Hide chat button if user is not logged in or is the product owner
  if (!session?.user?.email || session.user.email === vendorEmail) {
    return null;
  }

  return (
    <button
      onClick={handleChatClick}
      className={`flex items-center w-[165px] justify-center gap-2 h-[48px] cursor-pointer bg-[#FFEEBE] text-white rounded-lg hover:bg-[#033d32] transition-colors ${className}`}
    >
      <span className="text-[#461602] text-[14px] font-semibold">Chat with {vendorName}</span>
      <Image src={chatIcon} alt={'image'}></Image>
    </button>
  );
};

export default ChatButton;