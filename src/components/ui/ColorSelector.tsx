import { clsx } from 'clsx';
import { NeumorphToggleGroup, NeumorphToggleGroupItem } from './NeumorphToggleGroup';

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

  /**
   * Layout variant.
   * - 'compact': Simple grid of color swatches (Buttons).
   * - 'full': Detailed list with color names, using NeumorphToggleGroup.
   * @default 'compact'
   */
  variant?: 'compact' | 'full';
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
  className,
  variant = 'compact',
}: ColorSelectorProps) {
  const getAnimationClass = (anim: ColorSelectorAnimation) => {
    switch (anim) {
      case 'grow':
        return 'hover:scale-105 active:scale-95';
      case 'shrink':
        return 'hover:scale-90 active:scale-95';
      case 'slide-up':
        return 'hover:-translate-y-1 active:translate-y-0';
      case 'slide-down':
        return 'hover:translate-y-1 active:translate-y-0';
      default:
        return '';
    }
  };

  const getShapeClass = (s: ColorSelectorShape) => {
    switch (s) {
      case 'circle':
        return 'rounded-full';
      case 'rounded':
        return 'rounded-xl';
      default:
        return 'rounded-xl';
    }
  };

  const renderCompact = () => (
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
            filter: `hue-rotate(${hue}deg)`,
          };
          title = `Hue: ${hue}°`;
        }

        return (
          <button
            key={String(colorItem)}
            onClick={() => onChange(colorItem)}
            className={clsx(
              'h-12 w-12 border-2 shadow-sm transition-all duration-200',
              getShapeClass(shape),
              getAnimationClass(animation),
              isSelected
                ? 'scale-110 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                : 'border-transparent',
              // Override animation transform if selected (to maintain scale-110)
              isSelected && animation === 'grow' && 'scale-110 transform hover:scale-110'
            )}
            style={style}
            title={title}
            aria-label={mode === 'palette' ? `Select color ${title}` : `Select hue ${title}`}
            aria-pressed={isSelected}
          />
        );
      })}
    </div>
  );

  const renderFull = () => {
    // Transform colors into NeumorphToggleGroupItems
    const items: NeumorphToggleGroupItem[] = colors.map((colorItem) => {
      let label = '';
      let style: React.CSSProperties = {};

      if (mode === 'palette') {
        label = String(colorItem);
        style = { backgroundColor: label };
      } else {
        const hue = Number(colorItem);
        label = `Hue: ${hue}°`;
        style = {
          backgroundColor: baseColor,
          filter: `hue-rotate(${hue}deg)`,
        };
      }

      return {
        value: String(colorItem),
        label: label,
        icon: (
          <div
            className={clsx(
              'h-full w-full border border-black/5 shadow-sm',
              getShapeClass(shape === 'circle' ? 'circle' : 'rounded')
            )}
            style={style}
          />
        ),
      };
    });

    return (
      <NeumorphToggleGroup
        items={items}
        value={String(value)}
        onChange={(val) => {
          // Convert back to number if mode is hue
          if (mode === 'hue') {
            onChange(Number(val));
          } else {
            onChange(val);
          }
        }}
        variant="pressed"
        itemOrientation="vertical"
        iconSize="3xl"
        className="w-full"
        gridSize={5} // Ensure grid layout for colors
      />
    );
  };

  return (
    <div className={className}>
      {title && (
        <label className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-300">
          {title}
        </label>
      )}
      {variant === 'full' ? renderFull() : renderCompact()}
    </div>
  );
}
