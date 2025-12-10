import { clsx } from "clsx";

export type ColorSelectorMode = 'palette' | 'hue';
export type ColorSelectorShape = 'circle' | 'rounded';
export type ColorSelectorAnimation = 'grow' | 'shrink' | 'slide-up' | 'slide-down';

interface ColorSelectorProps {
  /**
   * The mode of the color selector.
   * - 'palette': colors are hex strings
   * - 'hue': colors are hue degrees (numbers)
   */
  mode: ColorSelectorMode;
  
  /**
   * Array of colors to display.
   * If mode is 'palette', expects hex strings.
   * If mode is 'hue', expects numbers (degrees).
   */
  colors: (string | number)[];
  
  /**
   * The currently selected value.
   */
  value: string | number;
  
  /**
   * Callback when a color/hue is selected.
   */
  onChange: (value: any) => void;
  
  /**
   * Visual shape of the color buttons.
   * @default 'rounded'
   */
  shape?: ColorSelectorShape;
  
  /**
   * Hover animation effect.
   * @default 'grow'
   */
  animation?: ColorSelectorAnimation;
  
  /**
   * Base color to use for 'hue' mode.
   * The hues will be applied as hue-rotate filters on this base color.
   * @default '#3b82f6' (blue-500)
   */
  baseColor?: string;
  
  /**
   * Optional title for the color selector.
   */
  title?: string;

  /**
   * Optional className for the container grid
   */
  className?: string;
}

export function ColorSelector({
  mode,
  colors,
  value,
  onChange,
  shape = 'rounded',
  animation = 'grow',
  baseColor = '#3b82f6',
  title,
  className
}: ColorSelectorProps) {

  const getAnimationClass = (anim: ColorSelectorAnimation) => {
    switch (anim) {
      case 'grow': return 'hover:scale-105 active:scale-95';
      case 'shrink': return 'hover:scale-90 active:scale-95';
      case 'slide-up': return 'hover:-translate-y-1 active:translate-y-0';
      case 'slide-down': return 'hover:translate-y-1 active:translate-y-0';
      default: return '';
    }
  };

  const getShapeClass = (s: ColorSelectorShape) => {
    switch (s) {
      case 'circle': return 'rounded-full';
      case 'rounded': return 'rounded-xl';
      default: return 'rounded-xl';
    }
  };

  return (
    <div className={className}>
      {title && <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">{title}</label>}
      <div className="flex flex-wrap gap-3">
      {colors.map((colorItem) => {
        const isSelected = value === colorItem;
        
        let style: React.CSSProperties = {};
        let title = '';

        if (mode === 'palette') {
           // Expecting hex string
           const colorHex = String(colorItem);
           style = { backgroundColor: colorHex };
           title = colorHex;
        } else {
           // Expecting hue number
           const hue = Number(colorItem);
           style = {
               backgroundColor: baseColor,
               filter: `hue-rotate(${hue}deg)`
           };
           title = `Hue: ${hue}°`;
        }

        return (
          <button
            key={String(colorItem)}
            onClick={() => onChange(colorItem)}
            className={clsx(
              "w-12 h-12 transition-all duration-200 border-2 shadow-sm",
              getShapeClass(shape),
              getAnimationClass(animation),
              isSelected 
                ? "border-blue-500 scale-110 shadow-md ring-2 ring-blue-500/20" 
                : "border-transparent",
              // Override animation transform if selected (to maintain scale-110)
              isSelected && animation === 'grow' && 'transform scale-110 hover:scale-110', 
            )}
            style={style}
            title={title}
            aria-label={mode === 'palette' ? `Select color ${title}` : `Select hue ${title}`}
            aria-pressed={isSelected}
          />
        );
      })}
      </div>
    </div>
  );
}
