import { useForm } from "react-hook-form";
import { Input, Button } from "@chakra-ui/react";

export function SingleFieldForm({ getFormValues, formField, buttonText }) {
  const {
    handleSubmit,
    register,
    reset,
    formState: { isSubmitting },
  } = useForm();

  function onSubmit(values) {
    getFormValues(values);
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        p={10}
        type="text"
        placeholder={formField}
        {...register(formField, { required: true })}
        w="100%"
      />

      <Button isLoading={isSubmitting} type="submit">
        {buttonText}
      </Button>
    </form>
  );
}
