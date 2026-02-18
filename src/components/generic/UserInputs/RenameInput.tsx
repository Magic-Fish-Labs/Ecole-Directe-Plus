import React, { forwardRef, ComponentProps } from 'react';
import TextInput from './TextInput';

type InlineTextInputProps = Omit<ComponentProps<typeof TextInput>, "type">;

export default forwardRef<HTMLInputElement, InlineTextInputProps>(({ value, onChange, ...props }, ref) => {
	return <TextInput type="text" value={value} onChange={onChange} ref={ref} {...props} />;
});
