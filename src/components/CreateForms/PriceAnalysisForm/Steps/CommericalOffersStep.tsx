/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'

interface IProductsStepProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const CommericalOffersStep: React.FC<IProductsStepProps> = ({ formData, setFormData }) => {
  return (
    <>
      <div>CommericalOffersStep</div>
    </>
  )
}

export default CommericalOffersStep