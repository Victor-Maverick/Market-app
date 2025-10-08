

const categories = [
    { id: 1, name: "Electronics" },
    { id: 2, name: "Fashion" },
    { id: 3, name: "Food"},
    { id: 4, name: "Farm" },
    { id: 5, name: "Education" },
    { id: 6, name: "Home" },
    { id: 7, name: "Cars" },
    { id: 8, name: "Skin care" },
    { id: 9, name: "Computing" },
    { id: 10, name: "Health" },
];



const FeaturedCategories = ()=>{
    return (
        <div className="flex items-start justify-between px-25 py-6">
            <p className="text-[16px]">Featured categories</p>
            <div className="flex items-center justify-between gap-2">
                {categories.map(category => (
                    <div key={category.id}
                         className="h-[92px] w-[92px] bg-[#F5F5F5] rounded-[18px] text-center">
                        <p className="mt-14 text-[15px]">{category.name}</p>
                    </div>
                ))

                }
            </div>
        </div>
    )
}

export default FeaturedCategories;

