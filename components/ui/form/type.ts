import { ReactElement } from 'react';
import { ControllerRenderProps } from 'react-hook-form';

export interface IFormFieldOption {
  defaultValue?: string | boolean | undefined;
  name: string;
  label: string;
  placeholder?: string;
  description?: string;
  require: any;
  render: (item: IFormFieldOption, field: FormFieldType) => ReactElement;
}

export type FormFields = {
  [key: string]: IFormFieldOption;
};

export type FormFieldType = ControllerRenderProps<
  {
    [x: string]: any;
  },
  never
>;