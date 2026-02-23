import * as React from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          className={cn(
            "h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer",
            className
          )}
          ref={ref}
          {...props}
        />
        {label && (
          <label 
            htmlFor={props.id}
            className="text-sm font-medium leading-none cursor-pointer select-none"
            onClick={(e) => {
              if (props.onChange && !props.disabled) {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                if (input) {
                  input.checked = !input.checked;
                  const syntheticEvent = {
                    target: input,
                    currentTarget: input,
                  } as React.ChangeEvent<HTMLInputElement>;
                  props.onChange(syntheticEvent);
                }
              }
            }}
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };

