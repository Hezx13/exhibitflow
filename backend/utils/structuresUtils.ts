function mapHasValue(map: Map<string, any>, value: any) {
  let res = false;
  map.forEach((val) => {
    if (val === value) {
      res = true;
    }
  });
  return res;
}

export { mapHasValue };
