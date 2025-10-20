import { Button, DatePicker, Input, Select, type DatePickerProps } from "antd";
import React, { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { axiosAPI } from "@/services/axiosAPI";
import { useAppDispatch, useAppSelector } from "@/store/hooks/hooks";
import {
  setCounterParties,
  setRegions,
  setTypesOfGoods,
  setWarehouses,
} from "@/store/infoSlice/infoSlice";
import { Plus, Trash } from "lucide-react";
import CounterPartyForm from "./CounterPartyForm";
import Typography from "@mui/material/Typography";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../UI/table";
import { toast } from "react-toastify";
import FieldModal from "../modal/FieldModal";

const DATE_FORMAT = "YYYY-MM-DD HH:mm:ss";

interface ProductRow {
  raw_number: number;
  product: {
    id: string;
    name: string;
    name_uz: string;
    product_type: string;
    model: string;
    size:string
  };
  date_party:string;
  model: {
    id: string;
    name: string;
    name_uz: string;
    product_type: string;
  };
  product_type: {
    id: string;
    name: string;
    name_uz: string;
  };
  size: {
    id: string;
    name: string;
    name_uz: string;
    product_type: string;
    model: string;
  };
  unit: {
    id: string;
    name: string;
    name_uz: string;
  };
  quantity: number;
  price: number;
  summa: number; 
}

interface FormDataType {
  date_party: string;
  region: string;
  warehouse: string;
  counterparty: string;
  type_goods: string;
  responsible_person: string;
  products: ProductRow[],
}

const initialFormData = {
  date_party: new Date().toISOString().split("T")[0],
  region: "",
  warehouse: "",
  counterparty: "",
  type_goods: "",
  responsible_person:"",
  products: [],
}


const defaultProductRow = {
  id: "",
  name: "",
  name_uz: "",
  date_party: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
  product_type: { id: "", name: "", name_uz: "" },
  model: { id: "", name: "", name_uz: "", product_type: "" },
  size: { id: "", name: "", name_uz: "", product_type: "", model: "" },
  unit: { id: "", name: "", name_uz: "", product_type: "", model: "" },
  product: { id: "", name: "", name_uz: "", size:"", product_type: "", model: "" },
  quantity: 0,
  price: 0,
  summa: 0,

}



interface IProductInputFormProps {
  setIsCreateFormModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ProductInputForm: React.FC<IProductInputFormProps> = ({
  setIsCreateFormModalOpen,
}) => {
  // States
  const [dateValue, setDateValue] = useState<Dayjs | null>(dayjs());
  const [region, setRegion] = useState<string>("");
  const [warehouse, setWarehouse] = useState<string>("");
  const [selectedCounterParty, setSelectedCounterParty] =
    useState<string>("");
  const [createCounterPartyModal, setCreateCounterPartyModal] =
    useState<boolean>(false);
  const [responsiblePerson, setResponsiblePerson] = useState<
    IReponsiblePerson[]
  >([]);
  const [selectedResponsiblePerson, setSelectedResponsiblePerson] =
    useState<string>("");
  const [formData, setFormData] = useState<FormDataType>(initialFormData);
  type FieldName = "product_type" | "model" | "size" | "unit" | "product";
  const [active, setActive] = useState<{ field: FieldName; row: number } | null>(null);

  const {
    regions,
    warehouses,
    counterparties,
    typesOfGoods,
    currentCreatedCounterParty,
  } = useAppSelector((state) => state.info);
  const dispatch = useAppDispatch();

  const addRow = () => {
    setFormData(prev => ({ ...prev, products: [...prev.products, { raw_number: prev.products.length + 1, ...defaultProductRow }] }));
  }


  const datePickerOnChange: DatePickerProps["onChange"] = (value, dateString) => {
    if (typeof dateString === "string") {
      setDateValue(value);
      console.log(dateString.split(" ").join("T"))
      setFormData((prev: any) => ({
        ...prev,
        // date: dateString.split(" ").join("T"),
        date_party: dateString.split(" ").join("T"),
      }));
    }
  };

  // Handle create product input form submit
  const handleCreateProductInput = async (data: any) => {
    if (data.region && data.warehouse && data.counterparty && data.type_goods && data.responsible_person) {
      if (data.products.length === 0) {
        toast.error("Iltimos kamida bitta tovar qo'shing");
        return;
      } else {
        try {
          const response = await axiosAPI.post("receipts/create", data);
          if (response.status === 200) {
            toast.success("Tovar kirim qilindi");
            setIsCreateFormModalOpen(false);
          }
        } catch (error: any) {
          console.log(error);
          toast.error(error.response.data.error || "");
        }
      }
    } else {
      toast.error("Iltimos barcha maydonlarni to'ldiring");
    }
  };

  const handleSubmit = () => {
    handleCreateProductInput(formData);
  };


  // API Requests
  // Get regions
  const getRegionsList = React.useCallback(async () => {
    try {
      const response = await axiosAPI.get("regions/list/?order_by=2");
      if (response.status === 200) {
        dispatch(setRegions(response.data));
      }
    } catch (error) {
      console.log(error);
    }
  }, [dispatch]);

  // get warehouses list with region and district name
  const getWarehousesList = React.useCallback(async () => {
    if ((region) || (region === "Худудгаз Комплектатция" || region === "Худудгазтаъминот")) {
      const url = `warehouses/list/?region=${region}&&order_by=2`;
      try {
        const response = await axiosAPI.get(url);
        if (response.status === 200) {
          dispatch(setWarehouses(response.data));
        }
      } catch (error) {
        console.log(error);
      }
    }
  }, [region, dispatch]);

  // Get counter parties list
  const getCounterPartiesList = React.useCallback(async () => {
    try {
      const response = await axiosAPI.get("counterparties/list");
      if (response.status === 200) {
        dispatch(setCounterParties(response.data));
      }
    } catch (error) {
      console.log(error);
    }
  }, [dispatch]);

  // Get type of goods list
  const getTypeOfGoodsList = React.useCallback(async () => {
    try {
      const response = await axiosAPI.get("type_input/ ");
      if (response.status === 200) {
        dispatch(setTypesOfGoods(response.data));
      }
    } catch (error) {
      console.log(error);
    }
  }, [dispatch]);

  // Get Responsible Person for warehouse
  const getResponsiblePersonList = React.useCallback(async () => {
    if (warehouse) {
      const currentWarehouse = warehouses.find((w) => w.name === warehouse);
      if (!currentWarehouse) {
        setResponsiblePerson([]);
        setSelectedResponsiblePerson("");
        setFormData((prev: any) => ({ ...prev, responsible_person: "" }));
        return;
      }

      const url = `warehouses/responsible_person/${currentWarehouse.id}`;

      try {
        const response = await axiosAPI.get(url);
        if (response.status === 200) {
          const list: IReponsiblePerson[] = response.data;
          setResponsiblePerson(list);

          if (list.length === 1) {
            setSelectedResponsiblePerson(list[0].name);
            setFormData((prev: any) => ({
              ...prev,
              responsible_person: list[0].id,
            }));
          } else if (list.length > 1) {
            setSelectedResponsiblePerson("");
            setFormData((prev: any) => ({ ...prev, responsible_person: "" }));
          } else {
            toast("Ushbu ombor uchun moddiy javobgar shaxs topilmadi  . Iltimos, Administratorga murojat qiling!", { type: "error" });
          }
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      setResponsiblePerson([]);
      setSelectedResponsiblePerson("");
      setFormData((prev) => ({ ...prev, responsible_person: "" }));
    }
  }, [warehouse, warehouses]);

  // API - Products ================================

  // Effects
  useEffect(() => {
    if (regions.length === 0) getRegionsList();
  }, [regions, getRegionsList]);

  useEffect(() => {
    if ((region) || region === "Худудгазтаъминот" || region === "Худудгаз Комплектатция") getWarehousesList();
  }, [getWarehousesList, region]);

  useEffect(() => {
    getCounterPartiesList();
  }, [getCounterPartiesList, createCounterPartyModal]);

  useEffect(() => {
    getTypeOfGoodsList();
  }, [getTypeOfGoodsList]);

  useEffect(() => {
    getResponsiblePersonList();
  }, [warehouse, getResponsiblePersonList]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      counterparty: currentCreatedCounterParty
        ? currentCreatedCounterParty.id
        : "",
    }));
  }, [currentCreatedCounterParty]);


  return (
    <>
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex flex-col gap-6 h-full mt-6"
      >
        {/* Form fields */}
        <div className="grid grid-cols-4 gap-x-4 gap-y-6">
          {/* Date field */}
          <div className="flex flex-col">
            <label className="mb-1">Sana</label>
            <DatePicker
              showTime={{ format: "HH:mm:ss" }}
              value={dateValue}
              onChange={datePickerOnChange}
              format={DATE_FORMAT}
              className="z-10"
            />
          </div>

          {/* Region */}
          <div className="flex flex-col">
            <label className="mb-1">Viloyat</label>
            <Select
              placeholder="Viloyat tanlang"
              showSearch
              value={region || undefined}
              onChange={(value) => {
                setRegion(value);
                setWarehouse("");
                setResponsiblePerson([]);
                setSelectedResponsiblePerson("");
                setFormData((prev) => ({
                  ...prev,
                  region: regions.find((r) => r.name === value)?.id || "",
                  warehouse: "",
                  responsible_person: "",
                }));
              }}
            >
              {regions.map((region) => (
                <Select.Option key={region.id} value={region.name}>
                  {region.name}
                </Select.Option>
              ))}
            </Select>
          </div>

          {/* Warehouse */}
          <div className="flex flex-col">
            <label className="mb-1">Ombor</label>
            <Select
              placeholder="Omborni tanlang"
              disabled={warehouses.length === 0}
              value={warehouse || undefined}
              onChange={(value) => {
                setWarehouse(value);
                setResponsiblePerson([]);
                setSelectedResponsiblePerson("");
                setFormData((prev) => ({
                  ...prev,
                  warehouse: warehouses.find((w) => w.name === value)?.id || "",
                  responsible_person: "",
                }));
              }}
            >
              {warehouses.map((warehouse) => (
                <Select.Option key={warehouse.id} value={warehouse.name}>
                  {warehouse.name}
                </Select.Option>
              ))}
            </Select>
          </div>

          {/* CounterParty */}
          <div className="flex flex-col relative">
            <label className="mb-1">Kontragent</label>
            <Select
              placeholder="Kontragent tanlang"
              showSearch
              allowClear
              value={
                selectedCounterParty
                  ? selectedCounterParty
                  : currentCreatedCounterParty
                    ? currentCreatedCounterParty.name
                    : undefined
              }
              onChange={(value) => {
                const findCounterParty = counterparties.find(
                  (c) => c.name === value
                );
                if (findCounterParty) {
                  setSelectedCounterParty(value);
                  setFormData((prev) => ({
                    ...prev,
                    counterparty: findCounterParty.id,
                  }));
                }
              }}
            >
              <Select.Option
                className="bg-gray-200"
                value="create_new_counterparty"
              >
                <div className="flex items-center justify-center gap-2">
                  <span>
                    <Plus size={17} />
                  </span>
                  <span>Kontragent yaratish</span>
                </div>
              </Select.Option>
              {counterparties.map((counterparty, index) => (
                <Select.Option key={index} value={counterparty.name}>
                  {counterparty.name}
                </Select.Option>
              ))}
            </Select>
          </div>

          {/* Type of Goods */}
          <div className="flex flex-col">
            <label className="mb-1">Tovar kirim turi</label>
            <Select
              placeholder="Tovar turini tanlang"
              onChange={(value) => {
                setFormData((prev) => ({
                  ...prev,
                  type_goods:
                    typesOfGoods.find((t) => t.name === value)?.id || "",
                }));
              }}
            >
              {typesOfGoods.map((type, index) => (
                <Select.Option key={index} value={type.name}>
                  {type.name}
                </Select.Option>
              ))}
            </Select>
          </div>

          {/* Responsible Person */}
          <div className="flex flex-col">
            <label className="mb-1">M.J.Sh</label>
            <Select
              placeholder="Moddiy javobgar shaxsni tanlang"
              value={selectedResponsiblePerson || undefined}
              onChange={(value) => {
                setSelectedResponsiblePerson(value);
                setFormData((prev) => ({
                  ...prev,
                  responsible_person:
                    responsiblePerson.find((p) => p.name === value)?.id || "",
                }));
              }}
            >
              {responsiblePerson.map((person) => (
                <Select.Option key={person.id} value={person.name}>
                  {person.name}
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>

        {/* Products section */}
        <div className="border-t pt-4 flex flex-col items-start gap-4 relative">
          {formData.products.length ? (
            <div className="border w-full border-slate-200 rounded-lg shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="text-slate-700 font-semibold p-3 text-center">
                      №
                    </TableHead>
                    <TableHead className="text-slate-700 font-semibold p-3 text-center">
                      Sana
                    </TableHead>
                    <TableHead className="text-slate-700 font-semibold p-3 text-center">
                      Tovar turi
                    </TableHead>
                    <TableHead className="text-slate-700 font-semibold p-3 text-center">
                      Modeli
                    </TableHead>
                    <TableHead className="text-slate-700 font-semibold p-3 text-center">
                      O'lchami
                    </TableHead>
                    <TableHead className="text-slate-700 font-semibold p-3 text-center">
                      O'lchov birligi
                    </TableHead>
                    <TableHead className="text-slate-700 font-semibold p-3 text-center">
                      Tovar
                    </TableHead>
                    <TableHead className="text-slate-700 font-semibold p-3 text-center">
                      Miqdori
                    </TableHead>
                    <TableHead className="text-slate-700 font-semibold p-3 text-center">
                      Narxi UZS
                    </TableHead>
                    <TableHead className="text-slate-700 font-semibold p-3 text-center">
                      Summa
                    </TableHead>
                    <TableHead className="text-slate-700 font-semibold p-3 text-center">
                      Ochirish
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.products.map((product, index) => (
                    <TableRow key={index} className="even:bg-slate-50">
                      <TableCell className="text-slate-700 font-medium text-center p-3">
                        {index + 1}
                      </TableCell>

                      {/* Date party */}
                      <TableCell className="text-slate-700 font-medium p-3">
                        <DatePicker
                          showTime={{ format: "HH:mm:ss" }}
                          value={
                            product.date_party
                              ? dayjs(product.date_party, DATE_FORMAT)
                              : null
                          }
                          onChange={(_, dateString) => {
                            if (typeof dateString === "string") {
                              setFormData((prev) => ({
                                ...prev,
                                products: prev.products.map((p, i) =>
                                  i === index
                                    ? {
                                      ...p,
                                      date_party: dateString.split(" ").join("T"),
                                    }
                                    : p
                                ),
                              }));
                            }
                          }}
                          format={DATE_FORMAT}
                          className="w-full"
                        />
                      </TableCell>

                      {/* Product Type */}
                      <TableCell className="text-slate-700 font-medium p-3">
                        <Button className="w-full" onClick={() => setActive({ field: "product_type", row: product.raw_number })}>
                          <span className={product.product_type ? "text-gray-800" : "text-gray-400"}>
                            {product.product_type.id ? product.product_type.name_uz : "Tanlang"}
                          </span>
                        </Button>

                        {(active?.field === "product_type" && active.row === product.raw_number) && (
                          <FieldModal
                            field_name="product_type"
                            selectedItem={{ id: String(product.product_type || ""), name: "", name_uz: "" }}
                            setSelectedItem={(newItem) => {
                              if (!newItem) { setActive(null); return; } // bekor -> hech narsa qilmaymiz
                              console.log(newItem)
                              setFormData(prev => ({
                                ...prev,
                                products: prev.products.map(p => p.raw_number === active.row
                                  ? { ...p, product_type: { id: newItem.id, name: newItem.name, name_uz: newItem.name_uz } }
                                  : p
                                )
                              }))
                              setActive(null);
                            }}
                          />
                        )}
                      </TableCell>

                      {/* Product models */}
                      <TableCell className="text-slate-700 font-medium p-3">
                        <Button className="w-full" onClick={() => setActive({ field: "model", row: product.raw_number })}>
                          <span className={product.model ? "text-gray-800" : "text-gray-400"}>
                            {product.model.id ? product.model.name_uz : "Tanlang"}
                          </span>
                        </Button>
                          {active?.field === "model" && active.row === product.raw_number && (
                              <FieldModal
                                field_name="model"
                                selectedItem={{ id: String(product.model || ""), name: "", name_uz: "" }}
                                // FILTRGA NOM EMAS, **ID** yuboring!
                                selectedProductTypeId={product.product_type.name || ""}
                                setSelectedItem={(newItem) => {
                                  if (!newItem) { setActive(null); return; }
                                  setFormData(prev => ({
                                    ...prev,
                                    products: prev.products.map(p => p.raw_number === active.row ? { ...p, model: { id: String(newItem.id), name: newItem.name, name_uz: newItem.name_uz, product_type: p.model.product_type } } : p),
                                  }))
                                  setActive(null);
                                }}
                              />
                          )}
                      </TableCell>

                      {/* Product size */}
                      <TableCell className="text-slate-700 font-medium p-3">
                              <Button className="w-full" onClick={() => setActive({ field: "size", row: product.raw_number })}>
                                <span className={product.size ? "text-gray-800" : "text-gray-400"}>
                                  {product.size.id ? product.size.name : "Tanlang"}
                                </span>
                              </Button>

                              {active?.field === "size" && active.row === product.raw_number && (
                                <FieldModal
                                  field_name="size"
                                  selectedItem={{ id: String(product.size || ""), name: "", name_uz: "" }}
                                  // FILTRGA NOM EMAS, **ID** yuboring!
                                  selectedProductTypeId={product.product_type.name}
                                  selectedModelId={product.model.name || ""}
                                  setSelectedItem={(newItem) => {
                                    console.log(active)
                                    if (!newItem) { setActive(null); return; }
                                    setFormData(prev => ({
                                      ...prev,
                                      products: prev.products.map(p => p.raw_number === active.row ? { ...p, size: { id: String(newItem.id), name: newItem.name, name_uz: newItem.name_uz, product_type: p.size.product_type, model: p.size.model } } : p),
                                    }))
                                    setActive(null);
                                  }}
                                />
                              )}
                      </TableCell>

                      <TableCell className="text-slate-700 font-medium p-3">
                        <Button className="w-full" onClick={() => setActive({ field: "unit", row: product.raw_number })}>
                           <span className={product.unit ? "text-gray-800" : "text-gray-400"}>
                             {product.unit.id ? product.unit.name : "Tanlang"}
                           </span>
                         </Button>

                         {active?.field === "unit" && active.row === product.raw_number && (
                           <FieldModal
                             field_name="unit"
                             selectedItem={{ id: String(product.unit || ""), name: "", name_uz: "" }}
                             setSelectedItem={(newItem) => {
                               console.log(active)
                               if (!newItem) { setActive(null); return; }
                               setFormData(prev => ({
                                 ...prev,
                                 products: prev.products.map(p => p.raw_number === active.row
                                   ? { ...p, unit: { id: newItem.id, name: newItem.name, name_uz: newItem.name_uz } } : p
                                 )
                               }))
                               setActive(null);
                             }}
                           />
                         )}
                      </TableCell>

                      {/* Product */}
                      
                      <TableCell className="text-slate-700 font-medium p-3">
                        <Button className="w-full" disabled={!product.product_type}  onClick={() => setActive({ field: "size", row: product.raw_number })}>
                          <span className={product.product ? "text-gray-800" : "text-gray-400"}>
                                  {product.product.id ? product.product.name : "Tanlang"}
                          </span>
                        </Button>
                        {active?.field === "product" && active.row === product.raw_number && (
                            <FieldModal
                              field_name="product"
                              selectedItem={{
                                id: String(product.product.id || ""),
                                name: product.product.name || "",
                                name_uz: product.product.name_uz || ""
                              }}
                              selectedProductTypeId={product.product_type.id}
                              selectedModelId={product.model.id}
                              selectedSizeId={product.size.id}
                              setSelectedItem={newItem => {
                                if (!newItem) {
                                  setActive(null);
                                  return;
                                }
                                setFormData(prev => ({
                                  ...prev,
                                  products: prev.products.map(p =>
                                    p.raw_number === active.row
                                      ? {
                                          ...p,
                                          product: {
                                            id: String(newItem.id),
                                            name: newItem.name,
                                            name_uz: newItem.name_uz,
                                            product_type: p.product_type.id,
                                            model: p.model.id,
                                            size: p.size.id,
                                          },
                                        }
                                      : p
                                  ),
                                }));
                                setActive(null);
                              }}
                            />
                          )}
                      </TableCell>


                      {/* Quantity */}
                      <TableCell className="text-slate-700 font-medium p-3 w-[100px]">
                        <Input
                          type="number"
                          placeholder="Soni"
                          value={product.quantity || undefined}
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            setFormData((prev) => ({
                              ...prev,
                              products: prev.products.map((p, i) =>
                                i === index ? { ...p, quantity: value } : p
                              ),
                            }));
                          }}
                        />
                      </TableCell>

                      {/* Price */}
                      <TableCell className="text-slate-700 font-medium p-3 w-[10%] max-w-[18-3">
                        <Input
                          type="number"
                          placeholder="Narxi"
                          value={product.price || undefined}
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            setFormData((prev) => ({
                              ...prev,
                              products: prev.products.map((p, i) =>
                                i === index ? { ...p, price: value } : p
                              ),
                            }));
                          }}
                        />
                      </TableCell>

                      {/* Summa */}
                      <TableCell className="text-slate-700 font-medium p-3">
                        {product.price * product.quantity + " UZS"}
                      </TableCell>
                      <TableCell className="text-slate-700 font-medium p-3 w-[5-3">
                        <button
                          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              products: prev.products.filter(
                                (_, i) => i !== index
                              ),
                            }));
                          }}
                        >
                          <Trash size={16} />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="w-full text-center text-xl font-bold ">Hech qanday tovar tanlanmadi</div>
          )}
        </div>

        {/* Submit button */}

        <div className="flex items-center justify-end gap-4">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={addRow}
          >
            Tovar qo'shish
          </button>

          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded self-end"
            onClick={() => {
              const updatedProducts = formData.products.map((product: any) => ({
                ...product,
                summa: product.price * product.quantity,
              }));

              const updatedFormData = {
                ...formData,
                products: updatedProducts,
              };

              setFormData(updatedFormData);
              handleSubmit();
            }}
          >
            Saqlash
          </button>

        </div>


      </form>

      {createCounterPartyModal && (
        // Modal
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          {/* Inner */}
          <div
            className="bg-white rounded-lg min-w-[600px] p-6 overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Kontragent yaratish
            </Typography>

            <CounterPartyForm
              setFormData={setFormData}
              setCreateCounterPartyModal={setCreateCounterPartyModal}
              setSelectedCounterParty={setSelectedCounterParty}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ProductInputForm;