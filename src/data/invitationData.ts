export type Contact = {
  name: string;
  phone: string;
};

export type Venue = {
  name: string;
  address: string;
  bengaliName: string;
  mapUrl: string;
  image: string;
};

export const invitationData = {
  groom: 'Md. Rafiqul Islam (Pintu)',
  bride: 'Rupali Akter',
  monogram: 'RR',
  occasion: 'Walima',
  date: '16 January 2027',
  eventDateTime: '2027-01-16T13:00:00+06:00',
  timezone: 'Asia/Dhaka',
  feastTime: '1:00 PM',
  venue: {
    name: 'Dhalpur Community Center',
    address: 'Dhalpur New Road, Dhaka-1204',
    bengaliName: 'ধলপুর কমিউনিটি সেন্টার',
    mapUrl: 'https://maps.app.goo.gl/4nSg4i86ifxdoVgP7',
    image: '/assets/venue.jpeg',
  },
  contacts: [
    {
      name: 'Md. Abdus Sattar Sheikh',
      phone: '+8801552390899',
    },
    {
      name: 'Md. Shazidul Islam (Sazid)',
      phone: '+8801621075797',
    },
  ] as Contact[],
} as const;
