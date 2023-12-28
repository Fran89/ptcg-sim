const dfd = require('danfojs-node');

// Load DataFrame from Excel file
dfd.read_excel('C:\Users\Owner\Documents\GitHub\pokemonCardsService').then(df => {
  // Now you can use the DataFrame
  let columnName = "card_id" // the column name you want to search in
  let searchValue = "dp3-1" // the value you want to search for

  let result = df.filter(row => row[columnName] === searchValue);
  console.log(result);
});