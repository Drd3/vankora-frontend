import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useWizardContext } from "@/components/ui/wizard"
import { TxState } from "@/services/aave-pool-contract"
import { Check, CopyIcon, LoaderCircle } from "lucide-react"
import { useEffect } from "react"
import { toast } from "@/hooks/use-toast"

const BorrowConfirmationProcess = () => {
    const { data, goToPreviousStep, closeModal } = useWizardContext()
    const txStatus = data.txStatus as
        | { action: string; state: TxState; info?: string }
        | null
    const txResult = data.txResult as
        | {
            transactionHash: string
            blockNumber: number
            gasUsed: string
            amount: string
            symbol: string
        }
        | null
    const txHash = txResult?.transactionHash
    const shortenedTxHash =
        txHash ? `${txHash.slice(0, 6)}...${txHash.slice(-2)}` : ""
    const isError = txStatus?.state === "Error"
    const isFinished = txStatus?.state === "Finished"

    useEffect(() => {
        if (isError) {
            const errorMessage = txStatus?.info || "Ocurrió un error al procesar la transacción"
            const isUserRejected = 
                errorMessage.includes('user rejected') || 
                errorMessage.includes('denied') ||
                errorMessage.includes('cancel') ||
                errorMessage.includes('4001') // Código de error estándar para rechazo de usuario en MetaMask

            toast({
                title: isUserRejected ? "Transacción cancelada" : "Error en la transacción",
                description: isUserRejected 
                    ? "Has cancelado la firma de la transacción" 
                    : errorMessage,
                variant: "destructive"
            })
            goToPreviousStep()
        }
    }, [isError, txStatus?.info, goToPreviousStep])

    const getProgress = () => {
        if (!txStatus) return 0
        switch (txStatus.state) {
            case "WaitingForConfirmation":
                return 25
            case "Pending":
            return 50
            case "Finished":
            return 100
            case "Error":
            return 0
            default:
            return 0
        }
    }
    const progress = getProgress()

    return (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>Pedir prestamo</CardTitle>
            </CardHeader>
            <CardContent>
                {isFinished ? (
                <div className="w-full">
                    <div className="bg-green-300 p-2 rounded-full flex items-center justify-center w-12 h-12 mx-auto">
                        <Check/>
                    </div>
                    <div className="text-center my-2">
                        <h3 className="font-semibold">Prestamo realizado correctamente</h3>
                        <a href={"https://basescan.org/tx/" + txHash} target="_blank" className="text-sm text-sky-600">Ver en Basescan</a>
                    </div>
                    <div className="grid grid-cols-[7fr_3fr] gap-y-1 items-center text-sm mt-4">
                        <div className="font-semibold">Tx Hash</div>
                        <div className="text-right flex items-center">{shortenedTxHash} <Button variant="ghost" size="icon" className="ml-2"><CopyIcon/></Button></div>
                        <div className="font-semibold">Cantidad prestada </div>
                        <div className="text-right w-full">$ {Number(txResult?.amount).toFixed(2)} {txResult?.symbol}</div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex items-center justify-center gap-2 mt-4 w-full bg-gray-100 rounded-md">
                        <Button className="flex-1" onClick={closeModal}>Finalizar</Button>
                        <Button className="flex-1" variant="secondary">Apalancar</Button>
                    </div>
                </div>
            ) : <div className="w-full space-y-4">
                <div>
                    <LoaderCircle className="mx-auto animate-spin h-12 w-12 text-blue-500"/>
                </div>
                    <div className="text-center my-2">
                        <h3 className="font-semibold">
                        {txStatus?.state === "Error"
                            ? "Error en la transacción"
                            : "Procesando transacción..."}
                        </h3>
                    </div>
                    {/* Barra de progreso simple */}
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                        className={`h-2 transition-all ${
                            txStatus?.state === "Error" ? "bg-red-500" : "bg-blue-500"
                        }`}
                        style={{ width: `${progress}%` }}
                        />
                    </div>
                    {/* Texto debajo de la barra según el estado */}
                    <div className="text-xs text-gray-600 text-center">
                        {txStatus?.state === "WaitingForConfirmation" &&
                        "Esperando firma en la wallet..."}
                        {txStatus?.state === "Pending" &&
                        "Transacción enviada, esperando confirmación..."}
                        {txStatus?.state === "Error" &&
                        "Ocurrió un error. Revisa el mensaje o vuelve al paso anterior."}
                        {!txStatus && "Preparando transacción..."}
                    </div>
                    </div>}
            </CardContent>
        </Card>
    )
}

export default BorrowConfirmationProcess