/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'

interface IProductsStepProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const PriceAnalysisStep: React.FC<IProductsStepProps> = ({ formData, setFormData }) => {
  return (
    <>
      <div>PriceAnalysisStep</div>
    </>
  )
}

export default PriceAnalysisStep