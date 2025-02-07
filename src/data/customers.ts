export interface Customer {
  id: string
  companyName: string
  status: 'active' | 'dormant' | 'potential'
  address: {
    building: string
    street: string
    village: string
    town: string
    county: string
    postcode: string
  }
  contact: {
    title: string
    forename: string
    surname: string
    position: string
    email: string
    phone: string
  }
}

export const DUMMY_CUSTOMERS: Customer[] = [
  {
    id: "36",
    companyName: "Midcounties Co-Operative",
    status: "active",
    address: {
      building: "Co-Op House",
      street: "Warwick Technology Park",
      village: "",
      town: "Warwick",
      county: "Warwickshire",
      postcode: "CV34 6DA"
    },
    contact: {
      title: "Mr",
      forename: "John",
      surname: "Smith",
      position: "Operations Manager",
      email: "john.smith@midcounties.coop",
      phone: "01926 516000"
    }
  },
  {
    id: "39",
    companyName: "Central England Co-Operative",
    status: "active",
    address: {
      building: "Central House",
      street: "Hermes Road",
      village: "",
      town: "Lichfield",
      county: "Staffordshire",
      postcode: "WS13 6RH"
    },
    contact: {
      title: "Ms",
      forename: "Sarah",
      surname: "Johnson",
      position: "Regional Director",
      email: "s.johnson@centralengland.coop",
      phone: "01543 414141"
    }
  },
  {
    id: "41",
    companyName: "Gloucester Charities Trust",
    status: "active",
    address: {
      building: "Trust House",
      street: "67 London Road",
      village: "",
      town: "Gloucester",
      county: "Gloucestershire",
      postcode: "GL1 3HF"
    },
    contact: {
      title: "Mrs",
      forename: "Emma",
      surname: "Wilson",
      position: "Trust Manager",
      email: "e.wilson@gct.org",
      phone: "01452 500500"
    }
  },
  {
    id: "42",
    companyName: "YMCA",
    status: "active",
    address: {
      building: "YMCA Building",
      street: "Priors Road",
      village: "",
      town: "Cheltenham",
      county: "Gloucestershire",
      postcode: "GL52 5AH"
    },
    contact: {
      title: "Mr",
      forename: "David",
      surname: "Brown",
      position: "Center Manager",
      email: "d.brown@ymca.org",
      phone: "01242 257373"
    }
  },
  {
    id: "43",
    companyName: "FM Security",
    status: "active",
    address: {
      building: "Security House",
      street: "Tewkesbury Road",
      village: "",
      town: "Cheltenham",
      county: "Gloucestershire",
      postcode: "GL51 9SL"
    },
    contact: {
      title: "Mr",
      forename: "Michael",
      surname: "Taylor",
      position: "Operations Director",
      email: "m.taylor@fmsecurity.co.uk",
      phone: "01242 222333"
    }
  },
  {
    id: "44",
    companyName: "Lloyds Pharmacy",
    status: "active",
    address: {
      building: "Sapphire Court",
      street: "Walsgrave Triangle",
      village: "",
      town: "Coventry",
      county: "West Midlands",
      postcode: "CV2 2TX"
    },
    contact: {
      title: "Mrs",
      forename: "Rachel",
      surname: "Green",
      position: "Regional Manager",
      email: "r.green@lloydspharmacy.co.uk",
      phone: "02476 437000"
    }
  },
  {
    id: "46",
    companyName: "The Hospital Company",
    status: "active",
    address: {
      building: "Hospital House",
      street: "Business Park",
      village: "",
      town: "Worcester",
      county: "Worcestershire",
      postcode: "WR4 9FA"
    },
    contact: {
      title: "Dr",
      forename: "James",
      surname: "Wilson",
      position: "Director",
      email: "j.wilson@hospitalco.com",
      phone: "01905 888999"
    }
  }
]
