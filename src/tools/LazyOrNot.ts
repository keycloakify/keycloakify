import type { LazyExoticComponent, ComponentType } from "react";

export type LazyOrNot<Component extends ComponentType<any>> = LazyExoticComponent<Component> | Component;
