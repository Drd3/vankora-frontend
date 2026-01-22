import { useWizardContext, Wizard, WizardStep } from "@/components/ui/wizard"
import WithdrawForm from "./withdraw-form";
import { UserSupply } from "@/types/aave";
import WithdrawConfirmationProcess from "./withdraw-confirmation-process";

interface props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    asset: UserSupply;
}



const WithdrawProcess = ({open, onOpenChange, asset}: props) => {
    const steps: WizardStep[] = [
        {
            id: "form",
            title: "asset form",
            content: <WithdrawForm asset={asset} />
        },
        {
            id: "confirmation",
            title: "confirmation",
            content: <WithdrawConfirmationProcess />
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
            closeOnEscape={true}
            initialData={{ asset }}
        />
            
    )
}

export default WithdrawProcess