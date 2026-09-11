import { useEffect, useId, useState } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import { $apiq, usePostNewItem, type ShopItemDTO } from './api';
import type { AutocompleteInputChangeReason, FilterOptionsState } from '@mui/material';

interface ShopItemInput {
  inputValue?: string;
  itemId?: number;
  itemName: string;
}

const filter = createFilterOptions<ShopItemInput>();

export default function AddItemInput({ allItems }: { allItems: ShopItemDTO[] }) {
  const [options, setOptions] = useState<ShopItemInput[]>(
    allItems.map(i => { return { itemId: i.id, itemName: i.name } })
  );
  const [value, setValue] = useState<ShopItemInput | null>(null);

  // NOTE: if we set the inital state to `undefined`, the `Autocomplete`
  // component would think it's uncontrolled by this component so we set it to
  // `''` so we control the component.
  const [inputValue, setInputValue] = useState<string | undefined>('');
  const mutation = usePostNewItem();

  const addItem = (item: ShopItemInput) => {
    setOptions(opts => [...opts, {
      itemId: item.itemId,
      itemName: item.itemName,
    }] )
  };

  const createItem = (item: ShopItemInput) => {
    mutation.mutate({
      body: { name: item.itemName, quantity: 1 }
    }, {
      onSuccess: (newItem, _, __, ___) => {
        addItem({itemId: newItem.id, itemName: newItem.name})
      }
    })
  };

  const onChange = (
    _: React.SyntheticEvent<Element, Event>,
    newValue: string | ShopItemInput | null,
    // reason: AutocompleteInputChangeReason
  ) => {
    if (typeof newValue === 'string') {
      setValue({
        itemName: newValue,
      });
    } else if (newValue && newValue.inputValue) {
      // Create a new value from the user input
      const newItem = {
        itemName: newValue.inputValue,
      };
      createItem(newItem);
      setValue(newItem);
    } else {
      setValue(newValue);
    }

    // BUG: is this the bug????
    setInputValue('');
  }

  const onInputChange = (
    _: React.SyntheticEvent<Element, Event>,
    newInputValue: string | undefined,
    // reason: AutocompleteInputChangeReason
  ) => {
    if(value?.itemName !== newInputValue) {
      setInputValue(newInputValue);
    }
  }
  const filterOptions = (options: ShopItemInput[], params: FilterOptionsState<ShopItemInput>) => {
    const filtered = filter(options, params);

    const inputValueTrimmed = params.inputValue.trim();
    // Suggest the creation of a new value
    const isExisting = options.some((option) => inputValue === option.itemName);
    if (inputValueTrimmed !== '' && !isExisting) {
      filtered.push({
        inputValue,
        itemName: `Add "${inputValueTrimmed}"`,
      });
    }

    return filtered;
  }

  const getOptionLabel = (option:  string | ShopItemInput) => {
    // Value selected with enter, right from the input
    if (typeof option === 'string') {
      return option;
    }
    // Add "xxx" option created dynamically
    if (option.inputValue) {
      return option.inputValue;
    }
    // Regular option
    return option.itemName;
  };

  const renderOption = (
    props: React.HTMLAttributes<HTMLLIElement> & { key: React.Key; },
    option: ShopItemInput
  ) => {
    const { key, ...optionProps } = props;
    return (
      <li key={key} {...optionProps}>
        {option.itemName}
      </li>
    );
  }


  return (
    <>
      <Autocomplete
        id={useId()}

        // configuration
        selectOnFocus
        clearOnBlur
        handleHomeEndKeys
        freeSolo
        resetHighlightOnMouseLeave
        sx={{ width: 300 }}

        // The value entered by the user
        value={value}
        onChange={onChange}

        // The value typed by, and shown to, the user
        inputValue={inputValue}
        onInputChange={onInputChange}

        filterOptions={filterOptions}
        options={options}
        getOptionLabel={getOptionLabel}
        renderOption={renderOption}

        renderInput={(params) => (
          <TextField {...params} label="Add or create a shop item" />
        )}
      />
      {mutation.isPending ? <p>creating item...</p> : <></>}
    </>
  );
}
