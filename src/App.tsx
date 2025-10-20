import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { 
    DistrictOrder, DistrictOrderDetail, Home, Login, ProductInputDetailPage, ProductOutDetailPage,
    ProductOutput, ProductsInput, ProductTurnOverReport, RegionOrder, RegionOrderDetail, WarehouseTransfer,
    WarehouseTransferDetail, KomplektasiyaOrder, ComplektasiyaDetail,
    PriceAnalysis
} from "@/pages";
import { Layout } from "@/components";
import { Toaster } from "react-hot-toast";
import { ToastContainer } from "react-toastify"
import ProductMaterialsBalance from "./pages/Reports/ProductMaterialsBalance";
import RepublicOrder from "./pages/Orders/RepublicOrder/RepublicOrder";
import RepublicOrderDetail from "./pages/Orders/RepublicOrder/RepublicOrderDetail";
import Profile from "./pages/Profile/Profile";
import ApplicationLetter from "./components/CreateForms/ApplicationLetterForm/ApplicationLetter";

const routes = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "product-input",
        element: <ProductsInput />,
        children: [
          {
            path: "details/:id",
            element: <ProductInputDetailPage />,
          }
        ]
      },
      {
        path: "product-output",
        element: <ProductOutput />,
        children: [
          {
            path: "details/:id",
            element: <ProductOutDetailPage />,
          }
        ]
      },
      {
        path: "warehouse-transfer",
        element: <WarehouseTransfer />,
        children: [
          {
            path: "details/:id",
            element: <WarehouseTransferDetail />,
          }
        ]
      },
      {
        path: "order-by-districts",
        element: <DistrictOrder />,
        children: [
          {
            path: "order-details/:id",
            element: <DistrictOrderDetail />
          },
        ]
      },
      {
        path: "order-by-regions",
        element: <RegionOrder />,
        children: [
          {
            path: "order-details/:id",
            element: <RegionOrderDetail />
          }
        ]
      },
      {
        path: "order-by-republic",
        element: <RepublicOrder />,
        children: [
          {
            path: "order-details/:id",
            element: <RepublicOrderDetail />
          }
        ]
      },
      {
        path: "order-by-sale",
        element: <KomplektasiyaOrder />,
        children: [
          {
            path: "order-details/:id",
            element: <ComplektasiyaDetail/>
          }
        ]
      },
      {
        path: 'product-circulation-report',
        element: <ProductTurnOverReport />
      },
      {
        path: 'product-materials-balance',
        element: <ProductMaterialsBalance />
      },
      {
        path: 'profile',
        element: <Profile />
      },
      {
        path: "price-analysis",
        element: <PriceAnalysis />
      },
      {
        path: "appeal-letter",
        element: <ApplicationLetter/>
      }

    ],
  },
  {
    path: "/login",
    element: <Login />,
  },

]);

const App: React.FC = () => {

  return (
    <>
      <RouterProvider router={routes} />
      {/* <Test /> */}
      <ToastContainer />
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
};

export default App;
