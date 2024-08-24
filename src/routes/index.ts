import { Router } from "express";
import { UserRoutes } from "../modules/User/user.route";
import { ServiceRoutes } from "../modules/services/service.route";
import { CustomerRoutes } from "../modules/Customer/customer.route";
import { EmployeeRoutes } from "../modules/Employee/employee.route";
import { ManagerRoutes } from "../modules/Manager/manager.router";
import { UpdateUserRoutes } from "../modules/UpdateUser/userUpdate.route";
import { SettingsRoutes } from "../modules/Settings/settings.route";

const router = Router();

const moduleRoutes = [
  {
    path: "/users",
    route: UserRoutes,
  },
  {
    path: "/services",
    route: ServiceRoutes,
  },
  {
    path:"/customer",
    route:CustomerRoutes
  },
  {
    path: "/employee",
    route: EmployeeRoutes,
  },
  {
    path: "/manager",
    route: ManagerRoutes,
  },
  {
    path: "/user-profile-update",
    route: UpdateUserRoutes
  },
  {
    path: "/settings",
    route: SettingsRoutes
  }
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
