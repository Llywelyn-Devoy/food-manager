import { useEffect, useId, useState } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import { $apiq, usePostNewItem, type ShopItemDTO } from './api';
import type { AutocompleteInputChangeReason, FilterOptionsState } from '@mui/material';

interface Item<T> {
  // the value entered by the user
  value: string;
  // the value shown in the list
  label: string;
  // the underlying item
  item?: T;
}

export default function AddItemInput<T>(
  {
    items,
    toLabel,
    createNewCallback,
    onAddCallback,
  }: {
    //
    items: T[],
    //
    toLabel: (label: T) => string,
    // this is called when an non existing item is added, this allows for the
    // item to be officially created. Return null if unsuccessfull.
    onCreateCallback: (value: string) => T | null,
    // this is called whenever an item is selected
    onAddCallback: (item: T) => void,
}) {
  const filter = createFilterOptions<Item<T>>({
    trim: true,
  });

  const [options, setOptions] = useState<Item<T>[]>(
    items.map(i => {
      const label = toLabel(i);
      return {
        value: label,
        label: label,
        item: i,
      };
    })
  );

  // the current value that has been selected by pressing enter key or selecting
  // from the list
  const [value, setValue] = useState<Item<T> | null>(null);

  // The current value in the input box
  // NOTE: if we set the inital state to `undefined`, the `Autocomplete`
  // component would think it's uncontrolled by this component so we set it to
  // `''` so we control the component.
  const [inputValue, setInputValue] = useState<string | undefined>('');

  const addItem = (item: Item<T>) => {
    onAddCallback(item.item);
    setOptions(opts => [...opts, item] )
  };

  // const createItem = (item: Item<T>) => {
  //   addItem({itemId: newItem.id, itemName: newItem.name})
  // };

  const onChange = (
    _: React.SyntheticEvent<Element, Event>,
    enteredValue: string | Item<T> | null,
    // reason: AutocompleteInputChangeReason
  ) => {
    /*
     * When the user doesn't select an existing list item, nor opts to add this
     * item
     */
    if (typeof enteredValue === 'string') {
      // we do nothing
    }
    /*
     * When the user selects to add the item
     */
    else if (enteredValue && enteredValue.value) {
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
  const filterOptions = (options: Item[], params: FilterOptionsState<Item>) => {
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

  const getOptionLabel = (option:  string | Item) => {
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
    option: Item
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
