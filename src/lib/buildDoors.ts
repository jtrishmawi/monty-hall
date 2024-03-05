const buildDoors = (numberOfDoors: number = 3): Door[] => {
  const doors = [];
  for (let i = 0; i < numberOfDoors; i++) {
    doors.push({
      index: i,
      content: "💩",
      winner: false,
    });
  }
  const randomDoor = Math.floor(Math.random() * numberOfDoors);
  doors[randomDoor] = {
    ...doors[randomDoor],
    content: "🚗",
    winner: true,
  };
  return doors;
};

export default buildDoors;
