// Pages route only. /auth
import { handleAuth } from "../oauth/github.js";

export const onRequestGet = ({ request, env }) => handleAuth(request, env);
