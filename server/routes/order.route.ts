import express from "express"
import {isAuthenticated} from "../middlewares/isAuthenticated";
import { createCheckoutSession, getOrderById, getOrders, stripeWebhook, updateOrderStatus } from "../controller/order.controller";
const router = express.Router();

router.route("/").get(isAuthenticated, getOrders);
router.route("/:orderId").get(isAuthenticated, getOrderById);
router.route("/:orderId/status").put(isAuthenticated, updateOrderStatus);
router.route("/checkout/create-checkout-session").post(isAuthenticated, createCheckoutSession);
router.route("/webhook").post(express.raw({type: 'application/json'}), stripeWebhook);

export default router;