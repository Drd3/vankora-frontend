import { Wizard, WizardStep } from "@/components/ui/wizard"
import AssetSelector from "./asset-selector"
import SupplyForm from "./supply-form"
import AssetConfirmationProcess from "./asset-confirmation-process"

interface props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onClose: () => void;
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

const SupplyProccess = ({open, onOpenChange, onClose}: props) => {

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            onOpenChange(open);
            onClose();
        }
        else {
            onOpenChange(open);
        }
    }

    return(
        <Wizard 
            asModal={true}
            unstyledModal={true}
            steps={steps} 
            showProgress={false} 
            className="w-full"
            open={open}
            onOpenChange={handleOpenChange}
            onComplete={(data) => console.log(data)}
            hideTitle={true}
            withoutCard={true}
            resetOnClose={true}
            onStepChange={(stepIndex, data) => console.log(stepIndex, data)}
        />
            
    )
}

export default SupplyProccess