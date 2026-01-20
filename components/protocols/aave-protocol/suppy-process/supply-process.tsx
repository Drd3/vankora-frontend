import { Wizard, WizardStep } from "@/components/ui/wizard"
import AssetSelector from "./asset-selector"
import SupplyForm from "./supply-form"
import AssetConfirmationProcess from "./asset-confirmation-process"

interface props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const steps: WizardStep[] = [
    {
        id: "asset",
        title: "Select Asset",
        content: <AssetSelector/>
    },
    {
        id: "form",
        title: "asset form",
        content: <SupplyForm/>
    },
    {
        id: "confirmation",
        title: "confirmation",
        content: <AssetConfirmationProcess/>
    }
]

const SupplyProccess = ({open, onOpenChange}: props) => {

    return(
        <Wizard 
            asModal={true}
            unstyledModal={true}
            steps={steps} 
            showProgress={false} 
            className="w-full"
            open={open}
            onOpenChange={onOpenChange}
            onComplete={(data) => console.log(data)}
            hideTitle={true}
            withoutCard={true}
            resetOnClose={true}
            onStepChange={(stepIndex, data) => console.log(stepIndex, data)}
        />
            
    )
}

export default SupplyProccess