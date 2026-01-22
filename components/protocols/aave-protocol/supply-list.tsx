import { Button } from "@/components/ui/button";
import { Paper } from "@/components/ui/paper";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { fetchUserSupplies } from "@/subgraphs/user-supplies";
import { UserSuppliesRequest, UserSupply } from "@/types/aave";
import { BanknoteArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import SupplyProcess from "./suppy-process/supply-process";
import WithdrawProcess from "./withdraw-process/withdraw-process";
import { useAave } from "@/contexts/aave-context";

interface props {
    classname?: string 
}

const SupplyList = ({classname}: props) => {
    const { 
        supplyList, 
        isSupplyListLoading, 
        refreshSupplyList 
    } = useAave();
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [selectedSupply, setSelectedSupply] = useState<UserSupply | null>(null);
    
    const [isModalOpen, setIsModalOpen] = useState(false)

    const loadSupplyList = async () => {
        try {
        await refreshSupplyList();
        } catch (error) {
        console.error('Failed to load supply list:', error);
        }
    };

    useEffect(() => {
        loadSupplyList();
    }, []);

    const handleClose = () => {
        loadSupplyList();
    }

    if (isSupplyListLoading) {
        return (
            <Paper elevation={"md"} className={classname + " " + "border-[#F89A30]"}>
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-[#F6A901] rounded-full">
                        <BanknoteArrowUp className=""/>
                    </div>
                    <h3 className="font-bold">
                        Tus colaterales
                    </h3>
                </div>
                <div className="space-y-6 mt-8">
                    {/* Table's Header */}
                    <div className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-2 pb-2 border-b-2 text-gray-400">
                        <div className="text-xs font-bold text-muted-foreground">Token</div>
                        <div className="text-xs font-bold text-muted-foreground text-center">
                            <Popover openOnHover>
                                <PopoverTrigger>Colateral</PopoverTrigger>
                                <PopoverContent>
                                    <h3 className="font-bold mb-4">¿Qué es el Colateral?</h3>
                                    <p className="text-sm">
                                        El colateral son los activos que depositas como garantía para pedir préstamos en plataformas DeFi. Estos activos aseguran al prestamista que podrás devolver el préstamo. Si el valor del colateral cae por debajo de un cierto umbral, podría liquidarse para cubrir la deuda. Cuanto más colateral proporciones, menor será el riesgo de liquidación.
                                    </p>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="text-xs font-bold text-muted-foreground text-center">
                            <Popover openOnHover>
                                <PopoverTrigger>APY</PopoverTrigger>
                                <PopoverContent>
                                    <h3 className="font-bold mb-4">¿Qué es el Interes anual (APY)?</h3>
                                    <p className="text-sm">
                                        El APY (Annual Percentage Yield) es el rendimiento anual que puedes obtener por tus fondos, considerando el interés compuesto. En DeFi, indica cuánto podrías ganar al ahorrar, prestar o hacer staking durante un año. El APY es una estimación y puede variar según las condiciones del protocolo y del mercado.
                                    </p>
                                </PopoverContent>
                            </Popover>
                            
                        </div>
                        <div className="text-xs font-bold text-muted-foreground text-center">Acciones</div>
                    </div>

                    {/* data row */}
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div
                                key={i}
                                className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-4 items-center"
                            >
                                <div className="flex gap-1 items-center ">
                                    <Skeleton className="w-6 h-6 rounded-full" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                                <Skeleton className="h-4 w-20 mx-auto" />
                                <Skeleton className="h-4 w-12 mx-auto" />
                                <Skeleton className="h-8 w-20 ml-auto" />
                            </div>
                        ))}
                    </div>

                    {/* Botón Depositar con Modal */}
                    <Button 
                        variant="default" 
                        size="lg" 
                        className="w-full"
                        onClick={() => setIsModalOpen(true)}
                    >
                        Depositar
                    </Button>
                </div>
                <SupplyProcess 
                    open={isModalOpen} 
                    onOpenChange={setIsModalOpen} 
                    onClose={() => setIsModalOpen(false)}
                />
                
                {selectedSupply && (
                    <WithdrawProcess 
                        open={isWithdrawModalOpen} 
                        onOpenChange={(open) => {
                            setIsWithdrawModalOpen(open);
                            if (!open) setSelectedSupply(null);
                        }}
                        asset={selectedSupply}
                    />
                )}
            </Paper>
        );
    }

    return (
        <Paper elevation={"md"} className={classname + " " + "border-[#F89A30]"}>
            <div className="flex items-center gap-2">
                <div className="p-2 bg-[#F6A901] rounded-full">
                    <BanknoteArrowUp className=""/>
                </div>
                <h3 className="font-bold">
                    Tus colaterales
                </h3>
            </div>
            <div className="space-y-6 mt-8">
                {/* Table's Header */}
                <div className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-2 pb-2 border-b-2 text-gray-400">
                    <div className="text-xs font-bold text-muted-foreground">Token</div>
                    <div className="text-xs font-bold text-muted-foreground text-center">
                        <Popover openOnHover>
                            <PopoverTrigger>Colateral</PopoverTrigger>
                            <PopoverContent>
                                <h3 className="font-bold mb-4">¿Qué es el Colateral?</h3>
                                <p className="text-sm">
                                    El colateral son los activos que depositas como garantía para pedir préstamos en plataformas DeFi. Estos activos aseguran al prestamista que podrás devolver el préstamo. Si el valor del colateral cae por debajo de un cierto umbral, podría liquidarse para cubrir la deuda. Cuanto más colateral proporciones, menor será el riesgo de liquidación.
                                </p>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="text-xs font-bold text-muted-foreground text-center">
                        <Popover openOnHover>
                            <PopoverTrigger>APY</PopoverTrigger>
                            <PopoverContent>
                                <h3 className="font-bold mb-4">¿Qué es el Interes anual (APY)?</h3>
                                <p className="text-sm">
                                    El APY (Annual Percentage Yield) es el rendimiento anual que puedes obtener por tus fondos, considerando el interés compuesto. En DeFi, indica cuánto podrías ganar al ahorrar, prestar o hacer staking durante un año. El APY es una estimación y puede variar según las condiciones del protocolo y del mercado.
                                </p>
                            </PopoverContent>
                        </Popover>
                        
                    </div>
                    <div className="text-xs font-bold text-muted-foreground text-center">Acciones</div>
                </div>

                {/* data row */}
                <div className="space-y-4">
                    {
                    supplyList && supplyList.map((supply : UserSupply, i) => {

                        function formatTokenBalance(value: number) {
                            console.log(supply.currency.name, supply.balance.amount.value)
                            if (value < 0.001) return value.toFixed(6);
                            if (value < 1) return value.toFixed(4);
                            return value.toFixed(2);
                        }

                        return(
                            <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-4 items-center">
                            {supply.currency.imageUrl && (
                                <div className="flex gap-1 items-center ">
                                    <img 
                                        src={supply.currency.imageUrl} 
                                        alt={supply.currency.symbol}
                                        className="w-6 h-6 rounded-full"
                                    />
                                    <div className="text-sm text-gray-700">
                                        {supply.currency.symbol}
                                    </div>
                                </div>
                            )}
                            <div className="text-sm text-center">${formatTokenBalance(parseFloat(supply.balance.amount.value))}</div>
                            <div className="text-sm text-center">{supply.apy.formatted}%</div>
                                <Button 
                                    variant="secondary" 
                                    size="sm"
                                    onClick={() => {
                                        setSelectedSupply(supply);
                                        setIsWithdrawModalOpen(true);
                                    }}
                                >
                                    Retirar
                                </Button>
                            </div>
                        )
                    })
                    }
                </div>

                {/* Botón Depositar con Modal */}
                <Button 
                    variant="default" 
                    size="lg" 
                    className="w-full"
                    onClick={() => setIsModalOpen(true)}
                >
                    Depositar
                </Button>
            </div>
            <SupplyProcess 
                open={isModalOpen} 
                onOpenChange={setIsModalOpen} 
                onClose={() => handleClose()}
            />
            
            {selectedSupply && (
                <WithdrawProcess 
                    open={isWithdrawModalOpen} 
                    onOpenChange={(open) => {
                        setIsWithdrawModalOpen(open);
                        if (!open) setSelectedSupply(null);
                    }}
                    asset={selectedSupply}
                />
            )}
        </Paper>
    )
};

export default SupplyList