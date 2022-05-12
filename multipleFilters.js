// Filter (Array of Objects) based on provided filters (Object with Array values) 
export const filterArray = ({ dataToFilter, appliedFilters }) => {
  // We need to create an object where each filter is a function
  const filters = addFunctionsToFilters(Object.entries(appliedFilters));

  const filterKeys = Object.keys(filters);
  return dataToFilter.filter(item => {
    // validates all filter criteria
    return filterKeys.every(filterKey => {
      // Filters are also nested i.e ActionSlug.DocumentsSlug
      if (filterKey.includes('.')) {
        const nestedValues = filterKey.split('.');

        const nestedValue = nestedValues.reduce((prev, cur) => {
          //! Need isArray() fn from Lodash
          if (isArray(prev)) {
            return prev.map(el => el[cur]);
          }
          if (cur && prev[cur]) {
            return prev[cur];
          }
          return false;
        }, item);
        if (nestedValue) {
          return filters[filterKey](nestedValue);
        }
      }
      return filters[filterKey](item[filterKey]);
    });
  });
};
const addFunctionsToFilters = filterEntries => {
  let filtersWithFunctions = {};
  filterEntries.forEach(entry => {
    const filterName = entry[0];
    const selectedFilters = entry[1];

    filtersWithFunctions = {
      ...filtersWithFunctions,
      // Returns Boolean
      [filterName]: filterValue => {
        if (!filterValue) return false;
        
        if (typeof selectedFilters === 'string') {
          let result = false;

          const foundPosition = filterValue
            .toLowerCase()
            .search(selectedFilters.toLowerCase());

          result = foundPosition >= 0 ? true : false;
          return result;
        }
        if (isArray(filterValue)) {
          return filterValue.some(value => selectedFilters.includes(value));
        }
        return selectedFilters.includes(filterValue);
      }
    };
  });
  return filtersWithFunctions;
};
