const greenLineAnimation = () => {
  const greenLine = document.createElement('div');
  greenLine.style.width = '100%';
  greenLine.style.height = '1px';
  greenLine.style.backgroundColor = 'rgba(0,0,0,0)';
  greenLine.style.position = 'absolute';
  greenLine.style.top = '0px';
  greenLine.style.left = '0px';
  greenLine.style.pointerEvents = 'none';
  greenLine.style.transition = 'all 3.4s';
  greenLine.style.opacity = '1';
  greenLine.style.zIndex = '99999999';
  greenLine.style.boxShadow = '0 70px 50px 25px rgba(0, 0, 0, 0.15)';
  document.body.appendChild(greenLine);
  setTimeout(() => {
    greenLine.style.top = '100%';
    greenLine.style.height = '0px';
    greenLine.style.opacity = '0';
  }, 10);
};

const beaconAnimation = (repeat) => {
  const circle = document.createElement('div');
  circle.style.zIndex = '-1';
  circle.style.width = '100px';
  circle.style.height = '100px';
  circle.style.borderRadius = '400px';
  circle.style.backgroundColor = 'white';
  circle.style.position = 'absolute';
  circle.style.top = '50%';
  circle.style.left = '50%';
  circle.style.marginTop = '-50px';
  circle.style.marginLeft = '-50px';
  circle.style.opacity = '0';
  circle.style.pointerEvents = 'none';
  document.body.appendChild(circle);

  const animation = circle.animate(
    [
      { transform: 'scale(0)', opacity: '0' },
      { transform: 'scale(3)', opacity: repeat ? '0.45' : '0.8' },
      { transform: 'scale(7)', opacity: '0' },
    ],
    {
      duration: repeat ? 10000 : 1000,
      iterations: repeat ? Infinity : 1,
    },
  );
};

const bottomBeaconAnimation = (repeat) => {
  const circle = document.createElement('div');
  circle.style.zIndex = '-1';
  circle.style.width = '100px';
  circle.style.height = '100px';
  circle.style.borderRadius = '400px';
  circle.style.backgroundColor = 'white';
  circle.style.position = 'absolute';
  circle.style.top = '100vh';
  circle.style.left = '50%';
  circle.style.marginTop = '-50px';
  circle.style.marginLeft = '-50px';
  circle.style.opacity = '0';
  circle.style.pointerEvents = 'none';
  document.body.appendChild(circle);

  const animation = circle.animate(
    [
      { transform: 'scale(0)', opacity: '0' },
      { transform: 'scale(10)', opacity: repeat ? '0.25' : '0.9' },
      { transform: 'scale(20)', opacity: '0' },
    ],
    {
      duration: repeat ? 18000 : 1000,
      iterations: repeat ? Infinity : 1,
    },
  );
};
