import { Button } from "@/components/ui/button";
import { Paper } from "@/components/ui/paper";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { fetchUserBorrows, UserBorrow, UserBorrowsRequest } from "@/subgraphs/user-borrows";
import { fetchUserSupplies } from "@/subgraphs/user-supplies";
import { UserSuppliesRequest, UserSupply } from "@/types/aave";
import { BanknoteArrowDown } from "lucide-react";
import { useEffect, useState } from "react";


interface props {
    classname?: string 
}

const request: UserBorrowsRequest  = {
  user: "0xC69A8ACfd379fadc048e40C0075eCf85E395813d",
  markets: [
    {
      chainId: 8453,
      address: "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5"
    }
  ],
  orderBy: {
    debt: "ASC"
  }
};


const BorrowList = ({classname}: props) => {
    const [supplyList, setSupplyList] = useState<UserBorrow[]>([])

    useEffect(() => {
        const fetchData = async () => {
            try{
                const list = await fetchUserBorrows(request, "https://api.v3.aave.com/graphql");
                console.log()
                setSupplyList(list)
            }catch(error)
            {

            }
        };
    
        fetchData();
    },[])


    return (
        <Paper elevation={"md"} className={classname + " " + "border-primary h-[fit-content]"}>
            <div className="flex items-center gap-2">
                <div className="p-2 bg-primary rounded-full">
                    <BanknoteArrowDown className=""/>
                </div>
                <h3 className="font-bold">
                    Tus prestamos
                </h3>
            </div>
            <div className="space-y-6 mt-8">
                {/* Table's Header */}
                <div className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-2 pb-2 border-b-2 text-gray-400">
                    <div className="text-xs font-bold text-muted-foreground">Token</div>
                    <div className="text-xs font-bold text-muted-foreground text-center">
                        <Popover openOnHover>
                            <PopoverTrigger>Deuda</PopoverTrigger>
                            <PopoverContent>
                                <h3 className="font-bold mb-4">¿Qué es la Deuda en DeFi?</h3>
                                <p className="text-sm">
                                    La deuda representa la cantidad total que has pedido prestada en la plataforma. En DeFi, cuando pides un préstamo, se te cobrará un interés sobre esta cantidad. Es importante monitorear tu deuda y el valor de tu colateral, ya que si el valor del colateral cae demasiado en relación con tu deuda, podrías enfrentar una liquidación. Puedes pagar tu deuda en cualquier momento para reducir los intereses acumulados.
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
                <div className="space-y-4 hover:bg-gay-50">
                    {
                    supplyList.map((supply, i) => {

                        function formatTokenDebt(value: number) {
                            console.log(supply.currency.name, supply.debt.amount.value)
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
                            <div className="text-sm text-center">${formatTokenDebt(parseFloat(supply.debt.amount.value))}</div>
                            <div className="text-sm text-center">{supply.apy.formatted}%</div>
                                <Button variant="secondary" size="sm">
                                    Pagar
                                </Button>
                            </div>
                        )
                    })
                    }
                </div>

              {/* Botón Depositar */}
              <Button variant="default" size="lg" className="w-full">
                Pedir prestamo
              </Button>
            </div>
        </Paper>
    )
};

export default BorrowList