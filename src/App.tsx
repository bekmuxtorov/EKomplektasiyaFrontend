import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import {
  DistrictOrder, DistrictOrderDetail, Home, Login, ProductInputDetailPage, ProductOutDetailPage,
  ProductOutput, ProductsInput, ProductTurnOverReport, RegionOrder, RegionOrderDetail, WarehouseTransfer,
  WarehouseTransferDetail, KomplektasiyaOrder,
  PriceAnalysis
} from "@/pages";
import { Layout } from "@/components";
import { Toaster } from "react-hot-toast";
import { ToastContainer } from "react-toastify"
import ProductMaterialsBalance from "./pages/Reports/ProductMaterialsBalance";
import RepublicOrder from "./pages/Orders/RepublicOrder/RepublicOrder";
import RepublicOrderDetail from "./pages/Orders/RepublicOrder/RepublicOrderDetail";
import Profile from "./pages/Profile/Profile";
import ComplektasiyaOrderDetail from "./pages/Orders/Complektasiya/ComplektasiyaOrderDetail";

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
            element: <ComplektasiyaOrderDetail />
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
