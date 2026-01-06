import { Wizard, WizardStep } from "@/components/ui/wizard"
import AssetSelector from "./suppy-process/asset-selector"
import SupplyForm from "./suppy-process/supply-form"

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
    }
]

const SupplyProccess = () => {


    
    return(
        <Wizard 
            steps={steps} 
            showProgress={false} 
            className="w-full"
            onComplete={(data) => console.log(data)}
            hideTitle={true}
            withoutCard={true}
            onStepChange={(stepIndex, data) => console.log(stepIndex, data)}
        />
            
    )
}

export default SupplyProccess