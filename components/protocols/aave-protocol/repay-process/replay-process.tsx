import { useWizardContext, Wizard, WizardStep } from "@/components/ui/wizard"
import { UserBorrow } from "@/types/aave";
import RepayForm from "./repay-form";
import RepayConfirmationProcess from "./repay-confirmation-process";

interface props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    asset: UserBorrow;
}



const RepayProcess = ({open, onOpenChange, asset}: props) => {
    const steps: WizardStep[] = [
        {
            id: "repay",
            title: "Reembolsar",
            content: <RepayForm asset={asset} />
        },
        {
            id: "confirmation",
            title: "Confirmación",
            content: <RepayConfirmationProcess />
        }
    ]

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
            onStepChange={(stepIndex, data) => {
                // Set the asset data when the wizard initializes
                if (stepIndex === 0) {
                    data.asset = asset;
                }
                console.log(stepIndex, data);
            }}
            initialData={{ asset }}
        />
            
    )
}

export default RepayProcess