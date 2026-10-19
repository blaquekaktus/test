// Pages route only. /callback
import { handleCallback } from "../oauth/github.js";

export const onRequestGet = ({ request, env }) => handleCallback(request, env);
