"use client";

import { useState, useEffect } from "react";

export type Device = "mobile" | "tablet" | "desktop";

export interface DeviceInfo {
  device: Device;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
}

const MOBILE_MAX = 767;
const TABLET_MAX = 1023;

function getDevice(width: number): Device {
  if (width <= MOBILE_MAX) return "mobile";
  if (width <= TABLET_MAX) return "tablet";
  return "desktop";
}

function getDeviceInfo(width: number, height: number): DeviceInfo {
  const device = getDevice(width);
  return {
    device,
    isMobile: device === "mobile",
    isTablet: device === "tablet",
    isDesktop: device === "desktop",
    screenWidth: width,
    screenHeight: height,
  };
}

export function useDevice(): DeviceInfo {
  const [info, setInfo] = useState<DeviceInfo>(() => {
    if (typeof window === "undefined") {
      // SSR default: assume desktop (no flash of mobile UI)
      return getDeviceInfo(1024, 768);
    }
    return getDeviceInfo(window.innerWidth, window.innerHeight);
  });

  useEffect(() => {
    let raf = 0;
    function handleResize() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setInfo(getDeviceInfo(window.innerWidth, window.innerHeight));
      });
    }
    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  return info;
}
