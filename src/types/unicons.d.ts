declare module '@iconscout/react-unicons' {
  import { FC, SVGProps } from 'react';
  export interface UniconProps extends SVGProps<SVGElement> {
    color?: string;
    size?: string | number;
  }
  export const UilReact: FC<UniconProps>;
  // Add catch-all for icons
  const content: { [key: string]: FC<UniconProps> };
  export default content;
}
