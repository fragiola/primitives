import { Autocomplete } from "../../kit/ui/autocomplete.tsx";

/** The cities' popup: an Empty "No city found." and the List, each Item a city. */
export function CityPopup() {
    return (
        <Autocomplete.Portal>
            <Autocomplete.Positioner sideOffset={4}>
                <Autocomplete.Popup>
                    <Autocomplete.Empty>No city found.</Autocomplete.Empty>
                    <Autocomplete.List>
                        {(city: string) => (
                            <Autocomplete.Item key={city} value={city}>
                                {city}
                            </Autocomplete.Item>
                        )}
                    </Autocomplete.List>
                </Autocomplete.Popup>
            </Autocomplete.Positioner>
        </Autocomplete.Portal>
    );
}
