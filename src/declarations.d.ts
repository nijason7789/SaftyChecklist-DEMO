// This file contains global type declarations for the project

// Declare CSS modules
declare module '*.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// Declare image/asset modules
declare module '*.svg' {
  import * as React from 'react';
  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.webp';
