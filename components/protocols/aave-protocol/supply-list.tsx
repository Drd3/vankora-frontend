import { Button } from "@/components/ui/button";
import { Paper } from "@/components/ui/paper";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { fetchUserSupplies } from "@/subgraphs/user-supplies";
import { UserSuppliesRequest, UserSupply } from "@/types/aave";
import { BanknoteArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import SupplyProcess from "./suppy-process/supply-process";
import WithdrawProcess from "./withdraw-process/withdraw-process";

interface props {
    classname?: string 
}

const request: UserSuppliesRequest  = {
  user: "0xC69A8ACfd379fadc048e40C0075eCf85E395813d",
  markets: [
    {
      chainId: 8453,
      address: "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5"
    }
  ],
  collateralsOnly: false,
  orderBy: {
    balance: "ASC"
  }
};


const SupplyList = ({classname}: props) => {
    const [supplyList, setSupplyList] = useState<UserSupply[]>([])
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [selectedSupply, setSelectedSupply] = useState<UserSupply | null>(null);
    
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try{
                const list = await fetchUserSupplies(request, "https://api.v3.aave.com/graphql");
                console.log()
                setSupplyList(list)
            }catch(error)
            {

            }
        };
    
        fetchData();
    },[])


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
                    supplyList.map((supply : UserSupply, i) => {

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