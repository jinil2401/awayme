export interface IInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hasLabel: boolean;
  hasError?: boolean;
  error?: string;
  hasHelperText?: boolean;
  helperText?: string;
}
