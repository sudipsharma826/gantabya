"use client";
import { logIn, logOut } from "@/lib/authActions";
import { Session } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { useTransition } from "react";
import CircleLoadingButton from "./circleLoadingButton";


export default function NavBar({session}: {session: Session | null}) {
  const [isPending, startTransition] = useTransition();
  
  const navLinks = [
    { href: "/", label: "My Trips" },
    { href: "/about", label: "Gantabyas" },
  ];
  return (
    <nav className="bg-white shadow-md py-6 border-b border-gray-200 ">
      <div className="container mx-auto flex justify-between items-center px-6 lg:px-8">
        <Link href={"/"} className="flex items-center gap-2">
          <Image src={"/logo.png"} alt="Logo" width={40} height={40} />
          <span className="text-2xl font-bold text-gray-800">Gantabya</span>
        </Link>
        {/* Navigation Links */}
        <div className="flex items-center space-x-6">
          {session ? (
            <>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-900 hover:text-orange-500"
                >
                  {link.label}
                </Link>
              ))}
              <CircleLoadingButton
                variant="outline"
                size="sm"
                className="text-gray-900  border-gray-300 cursor-pointer"
                onClick={() => startTransition(() => logOut())}
                isLoading={isPending}
                loadingText="Logging out..."
              >
                LogOut
              </CircleLoadingButton>
            </>
          ) : (
            /* User SignIn Buttons with Next Auth */
            <CircleLoadingButton
              variant="outline"
              className="border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
              onClick={() => startTransition(() => logIn())}
              isLoading={isPending}
              loadingText="Signing in..."
              icon={
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 256 262"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g fill="none">
                    <path
                      d="M255.68 133.5c0-10.6-.95-18.4-3-26.4H130v48.3h71.7c-1.5 12.5-9.7 31.3-28 43.9l-.25 1.6 40.7 31.6 2.8.28c25.6-23.6 40.8-58.3 40.8-99.2z"
                      fill="#4285F4"
                    />
                    <path
                      d="M130 261c36.7 0 67.5-12.1 90-33l-43-33c-11.5 8.1-26.7 13.8-47 13.8-35.8 0-66.2-23.8-77.1-56.6l-1.6.13-42.1 32.6-.55 1.5c22.5 44.5 69.1 74.5 120.4 74.5z"
                      fill="#34A853"
                    />
                    <path
                      d="M52.9 152.2c-2.8-8.1-4.5-16.8-4.5-25.7s1.6-17.6 4.4-25.7l-.08-1.7-42.4-32.9-.98.47C1.3 87.3 0 104 0 126.5c0 22 1.3 39.2 13.9 59.1l39-30.9z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M130 51.1c25.7 0 43 11 52.8 20.3l38.6-37.6C197.1 12.2 166.7 0 130 0 79.1 0 32.5 30 9.9 74.6l42.4 32.9C63.8 75 94.2 51.1 130 51.1z"
                      fill="#EA4335"
                    />
                  </g>
                </svg>
              }
            >
              Sign In
            </CircleLoadingButton>
            )}
        </div>
      </div>
    </nav>
  );
}
