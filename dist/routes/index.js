"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_route_1 = require("../modules/User/user.route");
const service_route_1 = require("../modules/services/service.route");
const customer_route_1 = require("../modules/Customer/customer.route");
const employee_route_1 = require("../modules/Employee/employee.route");
const manager_router_1 = require("../modules/Manager/manager.router");
const router = (0, express_1.Router)();
const moduleRoutes = [
    {
        path: "/users",
        route: user_route_1.UserRoutes,
    },
    {
        path: "/services",
        route: service_route_1.ServiceRoutes,
    },
    {
        path: "/customer",
        route: customer_route_1.CustomerRoutes
    },
    {
        path: "/employee",
        route: employee_route_1.EmployeeRoutes,
    },
    {
        path: "/manager",
        route: manager_router_1.ManagerRoutes,
    }
];
moduleRoutes.forEach((route) => {
    router.use(route.path, route.route);
});
exports.default = router;
