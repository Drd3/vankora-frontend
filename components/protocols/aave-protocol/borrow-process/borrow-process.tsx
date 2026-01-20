import { Wizard, WizardStep } from "@/components/ui/wizard"
import BorrowAssetSelector from "./borrow-asset-selector";
import BorrowForm from "./borrow-form";
import BorrowConfirmationProcess from "./borrow-confirmation-process";

interface props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}


const steps: WizardStep[] = [
    {
        id: "asset",
        title: "Select Asset",
        content: <BorrowAssetSelector/>
    },
    {
        id: "borrow",
        title: "Borrow",
        content: <BorrowForm/>
    },
    {
        id: "confirmation",
        title: "Confirmation",
        content: <BorrowConfirmationProcess/>
    }
    
]


const BorrowProcess = ({open, onOpenChange}: props) => {
    return (
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

export default BorrowProcess