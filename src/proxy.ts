import { auth } from "@/lib/auth";

export default auth;

export const config = {
  matcher: ["/order/:path*", "/dashboard/:path*", "/inventory/:path*", "/cash/:path*", "/reports/:path*", "/settings/:path*"],
};
