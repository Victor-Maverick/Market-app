// components/MarketDropdown.tsx
'use client'

import Dropdown from '../vendorDropdown/Dropdown'

interface Market {
    id: number
    name: string
}

interface MarketDropdownProps {
    markets: Market[]
    selectedMarket: Market | null
    onSelect: (market: Market) => void
    disabled?: boolean
}

export default function MarketDropdown({
                                           markets,
                                           selectedMarket,
                                           onSelect,
                                           disabled = false,
                                       }: MarketDropdownProps) {
    return (
        <Dropdown
            options={markets}
            selectedOption={selectedMarket}
            onSelect={onSelect}
            placeholder="Market"
            disabled={disabled}
            getLabel={(market) => market.name}
        />
    )
}