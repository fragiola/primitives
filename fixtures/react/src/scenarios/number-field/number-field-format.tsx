import { useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Label } from "../../kit/ui/label.tsx";
import { NumberField } from "../../kit/ui/number-field.tsx";

const EUR = { style: "currency", currency: "EUR" } as const;
const PERCENT = { style: "percent" } as const;

/** spec/number-field.md, `/number-field/format` (`?locale=`, and `?dir=rtl`) */
export function NumberFieldFormat({ locale }: { locale?: string }) {
    const [price, setPrice] = useState<number | null>();
    const [discount, setDiscount] = useState<number | null>();
    return (
        <>
            <div className="flex flex-col items-start gap-4">
                <div className="flex flex-col items-start gap-1">
                    <Label htmlFor="price">Price</Label>
                    <NumberField.Root
                        id="price"
                        format={EUR}
                        defaultValue={1234.5}
                        step={0.5}
                        locale={locale}
                        onValueChange={(value: number | null) =>
                            setPrice(value)
                        }
                    >
                        <NumberField.Group>
                            <NumberField.Input />
                        </NumberField.Group>
                    </NumberField.Root>
                </div>
                <div className="flex flex-col items-start gap-1">
                    <Label htmlFor="discount">Discount</Label>
                    <NumberField.Root
                        id="discount"
                        format={PERCENT}
                        defaultValue={0.25}
                        step={0.01}
                        min={0}
                        max={1}
                        locale={locale}
                        onValueChange={(value: number | null) =>
                            setDiscount(value)
                        }
                    >
                        <NumberField.Group>
                            <NumberField.Input />
                        </NumberField.Group>
                    </NumberField.Root>
                </div>
            </div>
            <Output
                values={{
                    price: price === null ? "null" : price,
                    discount: discount === null ? "null" : discount,
                }}
            />
        </>
    );
}
