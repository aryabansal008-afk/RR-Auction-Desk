import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Shell } from "./components/Shell";

const Overview = lazy(() => import("./pages/Overview").then((module) => ({ default: module.Overview })));
const Explorer = lazy(() => import("./pages/Explorer").then((module) => ({ default: module.Explorer })));
const Pressure = lazy(() => import("./pages/Pressure").then((module) => ({ default: module.Pressure })));
const Compare = lazy(() => import("./pages/Compare").then((module) => ({ default: module.Compare })));
const WarRoom = lazy(() => import("./pages/WarRoom").then((module) => ({ default: module.WarRoom })));
const ReportIndex = lazy(() => import("./pages/Report").then((module) => ({ default: module.ReportIndex })));
const Report = lazy(() => import("./pages/Report").then((module) => ({ default: module.Report })));
const Method = lazy(() => import("./pages/Method").then((module) => ({ default: module.Method })));

export function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<Overview />} />
        <Route path="explorer" element={<Explorer />} />
        <Route path="pressure" element={<Pressure />} />
        <Route path="compare" element={<Compare />} />
        <Route path="war-room" element={<WarRoom />} />
        <Route path="reports" element={<ReportIndex />} />
        <Route path="reports/:group/:role/:id" element={<Report />} />
        <Route path="method" element={<Method />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
