import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
    className?: string;
}

export const OverviewIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <path
            opacity="0.4"
            d="M7.5 2.08362H12.5C13.6532 2.08362 14.583 3.01341 14.583 4.16663V15.8336C14.5828 16.9867 13.6531 17.9166 12.5 17.9166H7.5C6.34689 17.9166 5.41717 16.9867 5.41699 15.8336V4.16663C5.41699 3.01341 6.34679 2.08362 7.5 2.08362Z"
            fill="#022B23"
            stroke="#022B23"
            strokeWidth="0.833333"
        />
        <path
            d="M15.5583 4.44165H15.275C15.175 4.44165 15.0833 4.44165 14.9833 4.44998C14.9917 4.49165 15 4.53332 15 4.58332V5.83332V14.1666V15.4166C15 15.4667 14.9917 15.5083 14.9833 15.55C15.075 15.5583 15.1667 15.5583 15.275 15.5583H15.5583C17.775 15.5583 18.3333 15 18.3333 12.775V7.22498C18.3333 4.99998 17.775 4.44165 15.5583 4.44165Z"
            fill="#022B23"
        />
        <path
            d="M5 15.4166V14.1666V5.83332V4.58332C5 4.53332 5.00833 4.49165 5.01667 4.44998C4.91667 4.44165 4.825 4.44165 4.725 4.44165H4.44167C2.225 4.44165 1.66667 4.99998 1.66667 7.22498V12.775C1.66667 15 2.225 15.5583 4.44167 15.5583H4.725C4.825 15.5583 4.91667 15.5583 5.01667 15.55C5.00833 15.5083 5 15.4667 5 15.4166Z"
            fill="#022B23"
        />
    </svg>
);

export const MarketsIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <path
            d="M2.50833 9.34998V13.0916C2.50833 16.8333 4.00833 18.3333 7.75 18.3333H12.2417C15.9833 18.3333 17.4833 16.8333 17.4833 13.0916V9.34998"
            stroke="#1E1E1E"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M10 9.99996C11.525 9.99996 12.65 8.75829 12.5 7.23329L11.95 1.66663H8.05834L7.5 7.23329C7.35 8.75829 8.475 9.99996 10 9.99996Z"
            stroke="#1E1E1E"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M15.2583 9.99996C16.9417 9.99996 18.175 8.63329 18.0083 6.95829L17.775 4.66663C17.475 2.49996 16.6417 1.66663 14.4583 1.66663H11.9167L12.5 7.50829C12.6417 8.88329 13.8833 9.99996 15.2583 9.99996Z"
            stroke="#1E1E1E"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M4.7 9.99996C6.075 9.99996 7.31667 8.88329 7.45 7.50829L7.63333 5.66663L8.03334 1.66663H5.49167C3.30834 1.66663 2.475 2.49996 2.175 4.66663L1.95 6.95829C1.78333 8.63329 3.01667 9.99996 4.7 9.99996Z"
            stroke="#1E1E1E"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M10 14.1666C8.60833 14.1666 7.91667 14.8583 7.91667 16.25V18.3333H12.0833V16.25C12.0833 14.8583 11.3917 14.1666 10 14.1666Z"
            stroke="#1E1E1E"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export const VendorsIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <path
            d="M10.1 10.65C10.0417 10.6417 9.96667 10.6417 9.9 10.65C8.43333 10.6 7.26667 9.39998 7.26667 7.92498C7.26667 6.41665 8.48333 5.19165 10 5.19165C11.5083 5.19165 12.7333 6.41665 12.7333 7.92498C12.725 9.39998 11.5667 10.6 10.1 10.65Z"
            stroke="#171719"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M15.6167 16.15C14.1333 17.5084 12.1667 18.3334 10 18.3334C7.83333 18.3334 5.86667 17.5084 4.38334 16.15C4.46667 15.3667 4.96667 14.6 5.85834 14C8.14167 12.4834 11.875 12.4834 14.1417 14C15.0333 14.6 15.5333 15.3667 15.6167 16.15Z"
            stroke="#171719"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M10 18.3333C14.6024 18.3333 18.3333 14.6023 18.3333 9.99996C18.3333 5.39759 14.6024 1.66663 10 1.66663C5.39763 1.66663 1.66667 5.39759 1.66667 9.99996C1.66667 14.6023 5.39763 18.3333 10 18.3333Z"
            stroke="#171719"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export const LogisticsIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <path
            d="M10 11.6666H10.8333C11.75 11.6666 12.5 10.9166 12.5 9.99996V1.66663H5C3.75 1.66663 2.65834 2.35828 2.09167 3.37495"
            stroke="#171719"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M1.66667 14.1666C1.66667 15.55 2.78333 16.6666 4.16667 16.6666H5C5 15.75 5.75 15 6.66667 15C7.58333 15 8.33333 15.75 8.33333 16.6666H11.6667C11.6667 15.75 12.4167 15 13.3333 15C14.25 15 15 15.75 15 16.6666H15.8333C17.2167 16.6666 18.3333 15.55 18.3333 14.1666V11.6666H15.8333C15.375 11.6666 15 11.2916 15 10.8333V8.33329C15 7.87496 15.375 7.49996 15.8333 7.49996H16.9083L15.4833 5.0083C15.1833 4.49163 14.6334 4.16663 14.0334 4.16663H12.5V9.99996C12.5 10.9166 11.75 11.6666 10.8333 11.6666H10"
            stroke="#171719"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M6.66667 18.3333C7.58714 18.3333 8.33333 17.5871 8.33333 16.6667C8.33333 15.7462 7.58714 15 6.66667 15C5.74619 15 5 15.7462 5 16.6667C5 17.5871 5.74619 18.3333 6.66667 18.3333Z"
            stroke="#171719"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M13.3333 18.3333C14.2538 18.3333 15 17.5871 15 16.6667C15 15.7462 14.2538 15 13.3333 15C12.4129 15 11.6667 15.7462 11.6667 16.6667C11.6667 17.5871 12.4129 18.3333 13.3333 18.3333Z"
            stroke="#171719"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M18.3333 10V11.6667H15.8333C15.375 11.6667 15 11.2917 15 10.8333V8.33333C15 7.875 15.375 7.5 15.8333 7.5H16.9083L18.3333 10Z"
            stroke="#292D32"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M1.66667 6.66663H6.66667"
            stroke="#292D32"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M1.66667 9.16663H5"
            stroke="#292D32"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M1.66667 11.6666H3.33333"
            stroke="#292D32"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export const UsersIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <path
            d="M7.63334 9.05829C7.55 9.04996 7.45 9.04996 7.35834 9.05829C5.375 8.99163 3.8 7.36663 3.8 5.36663C3.8 3.32496 5.45 1.66663 7.5 1.66663C9.54167 1.66663 11.2 3.32496 11.2 5.36663C11.1917 7.36663 9.61667 8.99163 7.63334 9.05829Z"
            stroke="#171719"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M13.675 3.33337C15.2917 3.33337 16.5917 4.64171 16.5917 6.25004C16.5917 7.82504 15.3417 9.10837 13.7833 9.16671C13.7167 9.15837 13.6417 9.15837 13.5667 9.16671"
            stroke="#171719"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M3.46667 12.1334C1.45 13.4834 1.45 15.6834 3.46667 17.025C5.75833 18.5584 9.51667 18.5584 11.8083 17.025C13.825 15.675 13.825 13.475 11.8083 12.1334C9.525 10.6084 5.76667 10.6084 3.46667 12.1334Z"
            stroke="#171719"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M15.2833 16.6666C15.8833 16.5416 16.45 16.3 16.9167 15.9416C18.2167 14.9666 18.2167 13.3583 16.9167 12.3833C16.4583 12.0333 15.9 11.8 15.3083 11.6666"
            stroke="#171719"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export const TransactionsIcon: React.FC<IconProps> = ({
                                                          className,
                                                          ...props
                                                      }) => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <path
            d="M8.42499 9.29163H6.21666C5.69166 9.29163 5.26667 9.71659 5.26667 10.2416V14.5082H8.42499V9.29163V9.29163Z"
            stroke="#171719"
            strokeWidth="1.25"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M10.6344 5.5H9.3677C8.8427 5.5 8.41771 5.92501 8.41771 6.45001V14.5H11.5761V6.45001C11.5761 5.92501 11.1594 5.5 10.6344 5.5Z"
            stroke="#171719"
            strokeWidth="1.25"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M13.7901 10.7083H11.5818V14.5H14.7401V11.6583C14.7318 11.1333 14.3068 10.7083 13.7901 10.7083Z"
            stroke="#171719"
            strokeWidth="1.25"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M7.5 18.3333H12.5C16.6667 18.3333 18.3333 16.6666 18.3333 12.5V7.49996C18.3333 3.33329 16.6667 1.66663 12.5 1.66663H7.5C3.33333 1.66663 1.66667 3.33329 1.66667 7.49996V12.5C1.66667 16.6666 3.33333 18.3333 7.5 18.3333Z"
            stroke="#171719"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export const AdsIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <path
            d="M4.29167 1.66663V18.3333"
            stroke="#171719"
            strokeWidth="1.25"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M4.29167 3.33337H13.625C15.875 3.33337 16.375 4.58337 14.7917 6.16671L13.7917 7.16671C13.125 7.83337 13.125 8.91671 13.7917 9.50004L14.7917 10.5C16.375 12.0834 15.7917 13.3334 13.625 13.3334H4.29167"
            stroke="#171719"
            strokeWidth="1.25"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export const DisputeIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <path
            d="M10 6.45825V10.8333"
            stroke="#171719"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M17.5667 7.15011V12.8501C17.5667 13.7834 17.0667 14.6501 16.2583 15.1251L11.3083 17.9834C10.5 18.4501 9.49998 18.4501 8.68332 17.9834L3.73332 15.1251C2.92498 14.6584 2.42498 13.7917 2.42498 12.8501V7.15011C2.42498 6.21678 2.92498 5.35008 3.73332 4.87508L8.68332 2.01675C9.49165 1.55008 10.4917 1.55008 11.3083 2.01675L16.2583 4.87508C17.0667 5.35008 17.5667 6.20844 17.5667 7.15011Z"
            stroke="#171719"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M10 13.5V13.5833"
            stroke="#171719"
            strokeWidth="1.66667"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export const SupportIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <path
            d="M7.08333 15.8334H6.66667C3.33333 15.8334 1.66667 15.0001 1.66667 10.8334V6.66675C1.66667 3.33341 3.33333 1.66675 6.66667 1.66675H13.3333C16.6667 1.66675 18.3333 3.33341 18.3333 6.66675V10.8334C18.3333 14.1667 16.6667 15.8334 13.3333 15.8334H12.9167C12.6583 15.8334 12.4083 15.9584 12.25 16.1667L11 17.8334C10.45 18.5667 9.55 18.5667 9 17.8334L7.75 16.1667C7.61667 15.9834 7.30833 15.8334 7.08333 15.8334Z"
            stroke="#171719"
            strokeWidth="1.25"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M13.3304 9.16667H13.3379"
            stroke="#171719"
            strokeWidth="1.66667"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M9.99623 9.16667H10.0037"
            stroke="#171719"
            strokeWidth="1.66667"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M6.66209 9.16667H6.66957"
            stroke="#171719"
            strokeWidth="1.66667"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export const NotificationsIcon: React.FC<IconProps> = ({
                                                           className,
                                                           ...props
                                                       }) => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <path
            d="M10 5.3667V8.1417"
            stroke="#171719"
            strokeWidth="1.25"
            strokeMiterlimit="10"
            strokeLinecap="round"
        />
        <path
            d="M10.0167 1.66675C6.95 1.66675 4.46667 4.15008 4.46667 7.21675V8.96675C4.46667 9.53341 4.23334 10.3834 3.94167 10.8667L2.88334 12.6334C2.23334 13.7251 2.68334 14.9417 3.88334 15.3417C7.86667 16.6667 12.175 16.6667 16.1583 15.3417C17.2833 14.9667 17.7667 13.6501 17.1583 12.6334L16.1 10.8667C15.8083 10.3834 15.575 9.52508 15.575 8.96675V7.21675C15.5667 4.16675 13.0667 1.66675 10.0167 1.66675Z"
            stroke="#171719"
            strokeWidth="1.25"
            strokeMiterlimit="10"
            strokeLinecap="round"
        />
        <path
            d="M12.775 15.6833C12.775 17.2083 11.525 18.4583 10 18.4583C9.24167 18.4583 8.54166 18.1417 8.04166 17.6417C7.54166 17.1417 7.225 16.4417 7.225 15.6833"
            stroke="#171719"
            strokeWidth="1.25"
            strokeMiterlimit="10"
        />
    </svg>
);

export const SettingsIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <path
            d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z"
            stroke="#171719"
            strokeWidth="1.25"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M1.66667 10.7334V9.26669C1.66667 8.40003 2.375 7.68336 3.25 7.68336C4.75833 7.68336 5.375 6.6167 4.61667 5.30836C4.18333 4.55836 4.44167 3.58336 5.2 3.15003L6.64167 2.32503C7.3 1.93336 8.15 2.1667 8.54167 2.82503L8.63333 2.98336C9.38333 4.2917 10.6167 4.2917 11.375 2.98336L11.4667 2.82503C11.8583 2.1667 12.7083 1.93336 13.3667 2.32503L14.8083 3.15003C15.5667 3.58336 15.825 4.55836 15.3917 5.30836C14.6333 6.6167 15.25 7.68336 16.7583 7.68336C17.625 7.68336 18.3417 8.39169 18.3417 9.26669V10.7334C18.3417 11.6 17.6333 12.3167 16.7583 12.3167C15.25 12.3167 14.6333 13.3834 15.3917 14.6917C15.825 15.45 15.5667 16.4167 14.8083 16.85L13.3667 17.675C12.7083 18.0667 11.8583 17.8334 11.4667 17.175L11.375 17.0167C10.625 15.7084 9.39167 15.7084 8.63333 17.0167L8.54167 17.175C8.15 17.8334 7.3 18.0667 6.64167 17.675L5.2 16.85C4.44167 16.4167 4.18333 15.4417 4.61667 14.6917C5.375 13.3834 4.75833 12.3167 3.25 12.3167C2.375 12.3167 1.66667 11.6 1.66667 10.7334Z"
            stroke="#171719"
            strokeWidth="1.25"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export const SearchIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <path
            d="M9.58329 17.5C13.9555 17.5 17.5 13.9555 17.5 9.58329C17.5 5.21104 13.9555 1.66663 9.58329 1.66663C5.21104 1.66663 1.66663 5.21104 1.66663 9.58329C1.66663 13.9555 5.21104 17.5 9.58329 17.5Z"
            stroke="#707070"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M18.3333 18.3333L16.6666 16.6666"
            stroke="#707070"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export const ChevronDownIcon: React.FC<IconProps> = ({
                                                         className,
                                                         ...props
                                                     }) => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <path
            d="M5 7L8.64645 10.6464C8.84171 10.8417 9.15829 10.8417 9.35355 10.6464L13 7"
            stroke="#CCCCCC"
            strokeWidth="1.5"
            strokeLinecap="round"
        />
    </svg>
);

export const ArrowUpIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ transform: "rotate(-90deg)" }}
        {...props}
    >
        <path
            d="M3.45917 5.58252L7 2.04169L10.5408 5.58252"
            stroke="#52A43E"
            strokeWidth="0.875"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M7 11.9584V2.14087"
            stroke="#52A43E"
            strokeWidth="0.875"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export const ArrowDownIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ transform: "rotate(-90deg)" }}
        {...props}
    >
        <path
            d="M3.45923 8.41748L7.00006 11.9583L10.5409 8.41748"
            stroke="#FF5050"
            strokeWidth="0.875"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M7 2.04163V11.8591"
            stroke="#FF5050"
            strokeWidth="0.875"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export const ExportIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <path
            d="M5.99996 11.3333V7.33325L4.66663 8.66659"
            stroke="#8C8C8C"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M6 7.33325L7.33333 8.66659"
            stroke="#8C8C8C"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M14.6667 6.66659V9.99992C14.6667 13.3333 13.3334 14.6666 10 14.6666H6.00004C2.66671 14.6666 1.33337 13.3333 1.33337 9.99992V5.99992C1.33337 2.66659 2.66671 1.33325 6.00004 1.33325H9.33337"
            stroke="#8C8C8C"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M14.6667 6.66659H12C10 6.66659 9.33337 5.99992 9.33337 3.99992V1.33325L14.6667 6.66659Z"
            stroke="#8C8C8C"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

// Additional icons for vendor and logistics dashboards
export const ShopIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <path
            d="M2.50833 9.34998V13.0916C2.50833 16.8333 4.00833 18.3333 7.75 18.3333H12.2417C15.9833 18.3333 17.4833 16.8333 17.4833 13.0916V9.34998"
            stroke="#1E1E1E"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M10 9.99996C11.525 9.99996 12.65 8.75829 12.5 7.23329L11.95 1.66663H8.05834L7.5 7.23329C7.35 8.75829 8.475 9.99996 10 9.99996Z"
            stroke="#1E1E1E"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export const OrderIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <path
            d="M7.5 18.3333H12.5C16.6667 18.3333 18.3333 16.6666 18.3333 12.5V7.49996C18.3333 3.33329 16.6667 1.66663 12.5 1.66663H7.5C3.33333 1.66663 1.66667 3.33329 1.66667 7.49996V12.5C1.66667 16.6666 3.33333 18.3333 7.5 18.3333Z"
            stroke="#171719"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M6.66667 9.16663H13.3333"
            stroke="#171719"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M6.66667 12.5H10"
            stroke="#171719"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export const ReviewsIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <path
            d="M14.4333 2.84998L12.175 5.10831C11.8417 5.44165 11.8417 5.97498 12.175 6.30831L13.6917 7.82498C14.025 8.15831 14.5583 8.15831 14.8917 7.82498L17.15 5.56665C18.2583 6.82498 18.3333 8.59165 17.4 9.99998L9.99999 17.4C8.59166 18.3333 6.82499 18.2583 5.56666 17.15L2.84999 14.4333C1.74166 13.175 1.66666 11.4083 2.59999 9.99998L9.99999 2.59998C11.4083 1.66665 13.175 1.74165 14.4333 2.84998Z"
            stroke="#171719"
            strokeWidth="1.25"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M7.91667 14.1666L5.83334 12.0833"
            stroke="#171719"
            strokeWidth="1.25"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export const ChatsIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <path
            d="M7.08333 15.8334H6.66667C3.33333 15.8334 1.66667 15.0001 1.66667 10.8334V6.66675C1.66667 3.33341 3.33333 1.66675 6.66667 1.66675H13.3333C16.6667 1.66675 18.3333 3.33341 18.3333 6.66675V10.8334C18.3333 14.1667 16.6667 15.8334 13.3333 15.8334H12.9167C12.6583 15.8334 12.4083 15.9584 12.25 16.1667L11 17.8334C10.45 18.5667 9.55 18.5667 9 17.8334L7.75 16.1667C7.61667 15.9834 7.30833 15.8334 7.08333 15.8334Z"
            stroke="#171719"
            strokeWidth="1.25"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export const FleetIcon: React.FC<IconProps> = ({ className, ...props }) => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <path
            d="M10 11.6666H10.8333C11.75 11.6666 12.5 10.9166 12.5 9.99996V1.66663H5C3.75 1.66663 2.65834 2.35828 2.09167 3.37495"
            stroke="#171719"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M1.66667 14.1666C1.66667 15.55 2.78333 16.6666 4.16667 16.6666H5C5 15.75 5.75 15 6.66667 15C7.58333 15 8.33333 15.75 8.33333 16.6666H11.6667C11.6667 15.75 12.4167 15 13.3333 15C14.25 15 15 15.75 15 16.6666H15.8333C17.2167 16.6666 18.3333 15.55 18.3333 14.1666V11.6666H15.8333C15.375 11.6666 15 11.2916 15 10.8333V8.33329C15 7.87496 15.375 7.49996 15.8333 7.49996H16.9083L15.4833 5.0083C15.1833 4.49163 14.6334 4.16663 14.0334 4.16663H12.5V9.99996C12.5 10.9166 11.75 11.6666 10.8333 11.6666H10"
            stroke="#171719"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export const SuperGoLogo: React.FC<IconProps> = ({ className, ...props }) => (
    <svg
        width="43"
        height="43"
        viewBox="0 0 43 43"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        {...props}
    >
        <path
            d="M11.3817 14.8985C13.642 14.8985 15.4565 13.0839 15.4565 10.8236C15.4565 8.56341 13.642 6.74884 11.3817 6.74884C9.12147 6.74884 7.30691 8.56341 7.30691 10.8236C7.27508 13.0521 9.12147 14.8985 11.3817 14.8985ZM22.7784 22.9207C20.932 22.9207 19.4358 24.4169 19.4358 26.2633C19.4358 28.1097 20.932 29.6059 22.7784 29.6059C24.6248 29.6059 26.1211 28.1097 26.1211 26.2633C26.1529 24.4169 24.6567 22.9207 22.7784 22.9207ZM32.2969 9.93228C30.737 9.93228 29.4637 11.2057 29.4637 12.7655C29.4637 14.3254 30.737 15.5988 32.2969 15.5988C33.8568 15.5988 35.1302 14.3254 35.1302 12.7655C35.1302 11.1738 33.8568 9.93228 32.2969 9.93228ZM12.0184 18.4321C12.0184 17.0632 10.9042 15.949 9.53532 15.949C8.16644 15.949 7.05223 17.0632 7.05223 18.4321C7.05223 19.801 8.16644 20.9152 9.53532 20.9152C10.9042 20.9152 12.0184 19.801 12.0184 18.4321ZM13.4191 17.3497C13.4191 18.5594 14.3741 19.5144 15.5839 19.5144C16.7936 19.5144 17.7486 18.5594 17.7486 17.3497C17.7486 16.14 16.7936 15.185 15.5839 15.185C14.3741 15.185 13.4191 16.14 13.4191 17.3497ZM21.3141 21.8702C22.4283 21.8702 23.3196 20.9788 23.3196 19.8646C23.3196 18.7504 22.4283 17.8591 21.3141 17.8591C20.1998 17.8591 19.3085 18.7504 19.3085 19.8646C19.2766 20.947 20.1998 21.8702 21.3141 21.8702ZM31.0872 8.88175C32.2014 8.88175 33.0928 7.99039 33.0928 6.87618C33.0928 5.76198 32.2014 4.87061 31.0872 4.87061C29.973 4.87061 29.0817 5.76198 29.0817 6.87618C29.0817 7.99039 29.973 8.88175 31.0872 8.88175ZM29.3363 25.2765C28.2221 25.2765 27.3308 26.1678 27.3308 27.282C27.3308 28.3962 28.2221 29.2876 29.3363 29.2876C30.4505 29.2876 31.3419 28.3962 31.3419 27.282C31.3419 26.1678 30.4505 25.2765 29.3363 25.2765ZM15.7749 6.81251C16.9846 6.81251 17.9396 5.85748 17.9396 4.64777C17.9396 3.43806 16.9846 2.48303 15.7749 2.48303C14.5652 2.48303 13.6101 3.43806 13.6101 4.64777C13.6101 5.82565 14.597 6.81251 15.7749 6.81251ZM14.0558 20.5331C11.6364 20.5331 9.66266 22.5069 9.66266 24.9263C9.66266 27.3457 11.6364 29.3194 14.0558 29.3194C16.4752 29.2876 18.449 27.3139 18.449 24.8945C18.449 22.475 16.4752 20.5331 14.0558 20.5331ZM28.827 10.6326C28.827 7.32186 26.1529 4.64777 22.8421 4.64777C19.5313 4.64777 16.8572 7.32186 16.8572 10.6326C16.8572 13.9434 19.5313 16.6175 22.8421 16.6175C26.1529 16.6493 28.827 13.9434 28.827 10.6326ZM29.3363 16.0127C27.0442 16.0127 25.166 17.8909 25.166 20.183C25.166 22.475 27.0442 24.3533 29.3363 24.3533C31.6284 24.3533 33.5066 22.475 33.5066 20.183C33.5066 17.8909 31.6602 16.0127 29.3363 16.0127Z"
            fill="#022B23"
        />
        <path
            d="M22.1717 30.6565H19.9751L19.6886 39.984H22.4264L22.1717 30.6565Z"
            fill="#461602"
        />
    </svg>
);