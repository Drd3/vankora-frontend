import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Asset {
  aToken?: {
    address: string;
  };
  currency: {
    imageUrl: string;
    symbol: string;
  };
}

interface AssetSelectorProps {
  value: number;
  selectedAsset: Asset | null;
  onSelectedAssetChange: (asset: Asset) => void;
  assets: Asset[];
  label?: string;
  placeholder?: string;
  className?: string;
}

export function AssetSelector({
  value,
  selectedAsset,
  onSelectedAssetChange,
  assets,
  label = "Usando",
  placeholder = "Selecciona un asset",
  className = "",
}: AssetSelectorProps) {
  return (
    <div className={`mt-4 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-sm">{label}</label>
      </div>
      <div className="flex border-b-2">
        <div className="text-6xl font-semibold w-full">
          {value}
        </div>
        <Select 
          value={selectedAsset?.aToken?.address || ''} 
          onValueChange={(value) => {
            const selected = assets.find(asset => asset.aToken?.address === value);
            if (selected) onSelectedAssetChange(selected);
          }}
        >
          <SelectTrigger className="w-[fit-content] min-w-[120px]">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {assets && assets.length > 0 && assets.map((asset, index) => (
              <SelectItem key={asset.aToken?.address || index} value={asset.aToken?.address || ''}>
                <div className="flex items-center gap-2">
                  <img 
                    src={asset.currency.imageUrl} 
                    alt={asset.currency.symbol} 
                    className="w-4 h-4 rounded-full" 
                  />
                  <div className="text-md">{asset.currency.symbol}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
