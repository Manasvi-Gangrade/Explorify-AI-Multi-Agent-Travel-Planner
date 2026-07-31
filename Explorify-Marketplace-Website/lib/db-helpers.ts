import {
  dynamoDb,
  USERS_TABLE,
  PLANS_TABLE,
  BOOKINGS_TABLE,
  DEPARTURES_TABLE,
  DynamoDBUser,
  DynamoDBPlan,
  DynamoDBBooking,
  DynamoDBDeparture,
} from "./dynamodb";
import type {
  ExpressionAttributeValues,
  ExpressionAttributeNames,
} from "@/types/dynamodb-utils";
import {
  GetCommand,
  PutCommand,
  UpdateCommand,
  QueryCommand,
  ScanCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

// ============ IN-MEMORY DATABASE FALLBACK FOR DEVELOPMENT ============
const mockUsers: DynamoDBUser[] = [];
const mockPlans: DynamoDBPlan[] = [
  {
    planId: "p1",
    vendorId: "v1",
    name: "Delhi-Agra Vande Bharat Tour",
    description: "Experience the historic monuments of Delhi and the Taj Mahal in Agra with Vande Bharat Express speed.",
    price: 4999,
    isActive: true,
    images: [],
    duration: { value: 2, unit: "days" },
    startingPoint: "New Delhi (NDLS)",
    endingPoint: "Agra Cantt (AGC)",
    categories: ["Historical", "Train Tour"],
    interests: ["Culture"],
    highlights: ["Taj Mahal guided visit", "Agra Fort sightseeing", "Vande Bharat executive travel"],
    stops: [],
    included: ["Train tickets", "Hotel stay", "Tour guide"],
    excluded: ["Personal expenses", "Monument entry tickets"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    planId: "p2",
    vendorId: "v1",
    name: "Scenic Goa Beach Escapade",
    description: "Enjoy pristine beaches, local food, and water sports in beautiful Goa.",
    price: 12999,
    isActive: true,
    images: [],
    duration: { value: 5, unit: "days" },
    startingPoint: "Mumbai (CSMT)",
    endingPoint: "Madgaon (MAO)",
    categories: ["Leisure", "Beach Holiday"],
    interests: ["Relaxation"],
    highlights: ["Baga beach sunset", "Scuba diving in Grand Island", "Old Goa churches tour"],
    stops: [],
    included: ["Accommodation", "Breakfast", "Sightseeing transfers"],
    excluded: ["Lunch and dinner", "Water sports charges"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    planId: "p3",
    vendorId: "v2",
    name: "Spiritual Varanasi Ganga Aarti Tour",
    description: "Immerse yourself in the spirituality of Kashi with Ganga Aarti and temples visit.",
    price: 6999,
    isActive: true,
    images: [],
    duration: { value: 3, unit: "days" },
    startingPoint: "New Delhi (NDLS)",
    endingPoint: "Varanasi (BSB)",
    categories: ["Spiritual", "Heritage"],
    interests: ["Spirituality"],
    highlights: ["Subah-e-Banaras boat ride", "Evening Ganga Aarti", "Kashi Vishwanath Corridor visit"],
    stops: [],
    included: ["Hotel booking", "Ganga boat ride", "Temple tour guide"],
    excluded: ["Pooja offerings", "Flight/Train tickets to Varanasi"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];
const mockBookings: DynamoDBBooking[] = [];
const mockDepartures: DynamoDBDeparture[] = [];

export async function clearAllBookings(): Promise<void> {
  mockBookings.length = 0;
}

// Helper to determine if we should bypass AWS DynamoDB and use our local memory store
function isMockDb(): boolean {
  const key = process.env.AWS_ACCESS_KEY_ID || "";
  return !key || key.startsWith("mock") || key.includes("your_access_key");
}

// ============ USER OPERATIONS ============

export async function getUserByEmail(
  email: string,
): Promise<DynamoDBUser | null> {
  if (isMockDb()) {
    console.log("[MockDB] getUserByEmail:", email);
    return mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  try {
    const command = new ScanCommand({
      TableName: USERS_TABLE,
      FilterExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": email,
      },
    });
    const response = await dynamoDb.send(command);
    return response.Items && response.Items.length > 0
      ? (response.Items[0] as DynamoDBUser)
      : null;
  } catch (error) {
    console.error("Error getting user by email:", error);
    return null;
  }
}

export async function getUserById(
  userId: string,
): Promise<DynamoDBUser | null> {
  if (isMockDb()) {
    console.log("[MockDB] getUserById:", userId);
    return mockUsers.find((u) => u.userId === userId) || null;
  }

  try {
    const command = new GetCommand({
      TableName: USERS_TABLE,
      Key: { userId },
    });
    const response = await dynamoDb.send(command);
    return (response.Item as DynamoDBUser) || null;
  } catch (error) {
    console.error("Error getting user by ID:", error);
    return null;
  }
}

export async function createUser(user: DynamoDBUser): Promise<DynamoDBUser> {
  if (isMockDb()) {
    console.log("[MockDB] createUser:", user.email);
    // Remove if already exists to prevent duplicate profiles in memory
    const existingIndex = mockUsers.findIndex((u) => u.email.toLowerCase() === user.email.toLowerCase());
    if (existingIndex !== -1) {
      mockUsers[existingIndex] = user;
    } else {
      mockUsers.push(user);
    }
    return user;
  }

  const command = new PutCommand({
    TableName: USERS_TABLE,
    Item: user,
  });
  await dynamoDb.send(command);
  return user;
}

export async function updateUser(
  userId: string,
  updates: Partial<DynamoDBUser>,
): Promise<void> {
  if (isMockDb()) {
    console.log("[MockDB] updateUser:", userId);
    const index = mockUsers.findIndex((u) => u.userId === userId);
    if (index !== -1) {
      mockUsers[index] = { ...mockUsers[index], ...updates };
    }
    return;
  }

  const updateExpressions: string[] = [];
  const expressionAttributeValues: ExpressionAttributeValues = {};
  const expressionAttributeNames: ExpressionAttributeNames = {};

  Object.entries(updates).forEach(([key, value], index) => {
    if (key !== "userId") {
      const attributeName = `#attr${index}`;
      const attributeValue = `:val${index}`;
      updateExpressions.push(`${attributeName} = ${attributeValue}`);
      expressionAttributeNames[attributeName] = key;
      expressionAttributeValues[attributeValue] = value;
    }
  });

  if (updateExpressions.length === 0) return;

  const command = new UpdateCommand({
    TableName: USERS_TABLE,
    Key: { userId },
    UpdateExpression: `SET ${updateExpressions.join(", ")}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
  });

  await dynamoDb.send(command);
}

export async function getPendingVendors(): Promise<DynamoDBUser[]> {
  if (isMockDb()) {
    return mockUsers.filter((u) => u.role === "vendor" && !u.vendorVerified);
  }

  try {
    const command = new ScanCommand({
      TableName: USERS_TABLE,
      FilterExpression: "#role = :role AND vendorVerified = :verified",
      ExpressionAttributeNames: {
        "#role": "role",
      },
      ExpressionAttributeValues: {
        ":role": "vendor",
        ":verified": false,
      },
    });
    const response = await dynamoDb.send(command);
    return (response.Items || []) as DynamoDBUser[];
  } catch (error) {
    console.error("Error getting pending vendors:", error);
    return [];
  }
}

// ============ PLAN OPERATIONS ============

export async function getPlanById(
  planId: string,
): Promise<DynamoDBPlan | null> {
  if (isMockDb()) {
    return mockPlans.find((p) => p.planId === planId) || null;
  }

  try {
    const command = new GetCommand({
      TableName: PLANS_TABLE,
      Key: { planId },
    });
    const response = await dynamoDb.send(command);
    return (response.Item as DynamoDBPlan) || null;
  } catch (error) {
    console.error("Error getting plan by ID:", error);
    return null;
  }
}

export async function getAllActivePlans(): Promise<DynamoDBPlan[]> {
  if (isMockDb()) {
    console.log("[MockDB] getAllActivePlans");
    return mockPlans;
  }

  try {
    const command = new ScanCommand({
      TableName: PLANS_TABLE,
      FilterExpression: "isActive = :isActive",
      ExpressionAttributeValues: {
        ":isActive": true,
      },
    });
    const response = await dynamoDb.send(command);
    return (response.Items || []) as DynamoDBPlan[];
  } catch (error) {
    console.error("Error getting all active plans:", error);
    return [];
  }
}

export async function getPlansByVendor(
  vendorId: string,
): Promise<DynamoDBPlan[]> {
  if (isMockDb()) {
    return mockPlans.filter((p) => p.vendorId === vendorId);
  }

  try {
    const command = new ScanCommand({
      TableName: PLANS_TABLE,
      FilterExpression: "vendorId = :vendorId",
      ExpressionAttributeValues: {
        ":vendorId": vendorId,
      },
    });
    const response = await dynamoDb.send(command);
    return (response.Items || []) as DynamoDBPlan[];
  } catch (error) {
    console.error("Error getting plans by vendor:", error);
    return [];
  }
}

export async function createPlan(plan: DynamoDBPlan): Promise<DynamoDBPlan> {
  if (isMockDb()) {
    mockPlans.push(plan);
    return plan;
  }

  const command = new PutCommand({
    TableName: PLANS_TABLE,
    Item: plan,
  });
  await dynamoDb.send(command);
  return plan;
}

export async function updatePlan(
  planId: string,
  updates: Partial<DynamoDBPlan>,
): Promise<void> {
  if (isMockDb()) {
    const index = mockPlans.findIndex((p) => p.planId === planId);
    if (index !== -1) {
      mockPlans[index] = { ...mockPlans[index], ...updates };
    }
    return;
  }

  const updateExpressions: string[] = [];
  const expressionAttributeValues: ExpressionAttributeValues = {};
  const expressionAttributeNames: ExpressionAttributeNames = {};

  Object.entries(updates).forEach(([key, value], index) => {
    if (key !== "planId") {
      const attributeName = `#attr${index}`;
      const attributeValue = `:val${index}`;
      updateExpressions.push(`${attributeName} = ${attributeValue}`);
      expressionAttributeNames[attributeName] = key;
      expressionAttributeValues[attributeValue] = value;
    }
  });

  if (updateExpressions.length === 0) return;

  const command = new UpdateCommand({
    TableName: PLANS_TABLE,
    Key: { planId },
    UpdateExpression: `SET ${updateExpressions.join(", ")}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
  });

  await dynamoDb.send(command);
}

export async function deletePlan(planId: string): Promise<void> {
  if (isMockDb()) {
    const index = mockPlans.findIndex((p) => p.planId === planId);
    if (index !== -1) {
      mockPlans.splice(index, 1);
    }
    return;
  }

  const command = new DeleteCommand({
    TableName: PLANS_TABLE,
    Key: { planId },
  });
  await dynamoDb.send(command);
}

// ============ BOOKING OPERATIONS ============

export async function createBooking(
  booking: DynamoDBBooking,
): Promise<DynamoDBBooking> {
  if (isMockDb()) {
    mockBookings.push(booking);
    return booking;
  }

  const command = new PutCommand({
    TableName: BOOKINGS_TABLE,
    Item: booking,
  });
  await dynamoDb.send(command);
  return booking;
}

export async function getBookingsByUser(
  userId: string,
): Promise<DynamoDBBooking[]> {
  if (isMockDb()) {
    return mockBookings.filter((b) => b.userId === userId);
  }

  try {
    const command = new ScanCommand({
      TableName: BOOKINGS_TABLE,
      FilterExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": userId,
      },
    });
    const response = await dynamoDb.send(command);
    return (response.Items || []) as DynamoDBBooking[];
  } catch (error) {
    console.error("Error getting bookings by user:", error);
    return [];
  }
}

export async function getBookingById(
  bookingId: string,
): Promise<DynamoDBBooking | null> {
  if (isMockDb()) {
    return mockBookings.find((b) => b.bookingId === bookingId) || null;
  }

  try {
    const command = new GetCommand({
      TableName: BOOKINGS_TABLE,
      Key: { bookingId },
    });
    const response = await dynamoDb.send(command);
    return (response.Item as DynamoDBBooking) || null;
  } catch (error) {
    console.error("Error getting booking by ID:", error);
    return null;
  }
}

export async function getBookingByPaymentId(
  razorpayPaymentId: string,
): Promise<DynamoDBBooking | null> {
  if (isMockDb()) {
    return mockBookings.find((b) => b.razorpayPaymentId === razorpayPaymentId) || null;
  }

  try {
    const command = new ScanCommand({
      TableName: BOOKINGS_TABLE,
      FilterExpression: "razorpayPaymentId = :paymentId",
      ExpressionAttributeValues: {
        ":paymentId": razorpayPaymentId,
      },
    });
    const response = await dynamoDb.send(command);
    return response.Items && response.Items.length > 0
      ? (response.Items[0] as DynamoDBBooking)
      : null;
  } catch (error) {
    console.error("Error getting booking by payment ID:", error);
    return null;
  }
}

export async function updateBookingStatus(
  bookingId: string,
  paymentStatus: "pending" | "completed" | "failed",
): Promise<void> {
  if (isMockDb()) {
    const index = mockBookings.findIndex((b) => b.bookingId === bookingId);
    if (index !== -1) {
      mockBookings[index].paymentStatus = paymentStatus;
    }
    return;
  }

  const command = new UpdateCommand({
    TableName: BOOKINGS_TABLE,
    Key: { bookingId },
    UpdateExpression: "SET paymentStatus = :status",
    ExpressionAttributeValues: {
      ":status": paymentStatus,
    },
  });
  await dynamoDb.send(command);
}

export async function getBookingsByPlan(
  planId: string,
): Promise<DynamoDBBooking[]> {
  if (isMockDb()) {
    return mockBookings.filter((b) => b.planId === planId);
  }

  try {
    const command = new ScanCommand({
      TableName: BOOKINGS_TABLE,
      FilterExpression: "planId = :planId",
      ExpressionAttributeValues: {
        ":planId": planId,
      },
    });
    const response = await dynamoDb.send(command);
    return (response.Items || []) as DynamoDBBooking[];
  } catch (error) {
    console.error("Error getting bookings by plan:", error);
    return [];
  }
}

export async function updateBooking(
  bookingId: string,
  updates: Partial<DynamoDBBooking>,
): Promise<void> {
  if (isMockDb()) {
    const index = mockBookings.findIndex((b) => b.bookingId === bookingId);
    if (index !== -1) {
      mockBookings[index] = { ...mockBookings[index], ...updates };
    }
    return;
  }

  const updateExpressions: string[] = [];
  const expressionAttributeValues: ExpressionAttributeValues = {};
  const expressionAttributeNames: ExpressionAttributeNames = {};

  Object.entries(updates).forEach(([key, value], index) => {
    if (key !== "bookingId") {
      const attributeName = `#attr${index}`;
      const attributeValue = `:val${index}`;
      updateExpressions.push(`${attributeName} = ${attributeValue}`);
      expressionAttributeNames[attributeName] = key;
      expressionAttributeValues[attributeValue] = value;
    }
  });

  if (updateExpressions.length === 0) return;

  const command = new UpdateCommand({
    TableName: BOOKINGS_TABLE,
    Key: { bookingId },
    UpdateExpression: `SET ${updateExpressions.join(", ")}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
  });

  await dynamoDb.send(command);
}

// ============ DEPARTURE OPERATIONS ============

export async function createDeparture(
  departure: DynamoDBDeparture,
): Promise<DynamoDBDeparture> {
  if (isMockDb()) {
    mockDepartures.push(departure);
    return departure;
  }

  const command = new PutCommand({
    TableName: DEPARTURES_TABLE,
    Item: departure,
  });
  await dynamoDb.send(command);
  return departure;
}

export async function getDepartureById(
  departureId: string,
): Promise<DynamoDBDeparture | null> {
  if (isMockDb()) {
    return mockDepartures.find((d) => d.departureId === departureId) || null;
  }

  try {
    const command = new GetCommand({
      TableName: DEPARTURES_TABLE,
      Key: { departureId },
    });
    const response = await dynamoDb.send(command);
    return (response.Item as DynamoDBDeparture) || null;
  } catch (error) {
    console.error("Error getting departure by ID:", error);
    return null;
  }
}

export async function getDeparturesByPlan(
  planId: string,
): Promise<DynamoDBDeparture[]> {
  if (isMockDb()) {
    return mockDepartures.filter((d) => d.planId === planId);
  }

  try {
    const command = new ScanCommand({
      TableName: DEPARTURES_TABLE,
      FilterExpression: "planId = :planId",
      ExpressionAttributeValues: {
        ":planId": planId,
      },
    });
    const response = await dynamoDb.send(command);
    return (response.Items || []) as DynamoDBDeparture[];
  } catch (error) {
    console.error("Error getting departures by plan:", error);
    return [];
  }
}

export async function updateDeparture(
  departureId: string,
  updates: Partial<DynamoDBDeparture>,
): Promise<void> {
  if (isMockDb()) {
    const index = mockDepartures.findIndex((d) => d.departureId === departureId);
    if (index !== -1) {
      mockDepartures[index] = { ...mockDepartures[index], ...updates };
    }
    return;
  }

  const updateExpressions: string[] = [];
  const expressionAttributeValues: ExpressionAttributeValues = {};
  const expressionAttributeNames: ExpressionAttributeNames = {};

  Object.entries(updates).forEach(([key, value], index) => {
    if (key !== "departureId") {
      const attributeName = `#attr${index}`;
      const attributeValue = `:val${index}`;
      updateExpressions.push(`${attributeName} = ${attributeValue}`);
      expressionAttributeNames[attributeName] = key;
      expressionAttributeValues[attributeValue] = value;
    }
  });

  if (updateExpressions.length === 0) return;

  const command = new UpdateCommand({
    TableName: DEPARTURES_TABLE,
    Key: { departureId },
    UpdateExpression: `SET ${updateExpressions.join(", ")}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
  });

  await dynamoDb.send(command);
}

export async function deleteDeparture(departureId: string): Promise<void> {
  if (isMockDb()) {
    const index = mockDepartures.findIndex((d) => d.departureId === departureId);
    if (index !== -1) {
      mockDepartures.splice(index, 1);
    }
    return;
  }

  const command = new DeleteCommand({
    TableName: DEPARTURES_TABLE,
    Key: { departureId },
  });
  await dynamoDb.send(command);
}

export async function updateBookedSeats(
  departureId: string,
  delta: number,
): Promise<boolean> {
  if (isMockDb()) {
    const departure = mockDepartures.find((d) => d.departureId === departureId);
    if (departure) {
      const nextSeats = departure.bookedSeats + delta;
      if (nextSeats >= 0 && nextSeats <= departure.totalCapacity) {
        departure.bookedSeats = nextSeats;
        departure.updatedAt = new Date().toISOString();
        return true;
      }
    }
    return false;
  }

  try {
    const command = new UpdateCommand({
      TableName: DEPARTURES_TABLE,
      Key: { departureId },
      UpdateExpression: "SET bookedSeats = bookedSeats + :delta, updatedAt = :updatedAt",
      ConditionExpression: 
        "attribute_exists(departureId) AND " +
        "bookedSeats + :delta >= :zero AND " +
        "bookedSeats + :delta <= totalCapacity",
      ExpressionAttributeValues: {
        ":delta": delta,
        ":zero": 0,
        ":updatedAt": new Date().toISOString(),
      },
      ReturnValues: "UPDATED_NEW",
    });
    
    const result = await dynamoDb.send(command);
    console.log(`Updated bookedSeats by ${delta}:`, result.Attributes?.bookedSeats);
    return true;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "ConditionalCheckFailedException") {
      console.log(
        `Seat update rejected: delta=${delta} would violate constraints (capacity or negative seats)`,
      );
      return false;
    }
    console.error("Error updating booked seats:", error);
    throw error;
  }
}

// Legacy functions - kept for backward compatibility
export async function incrementBookedSeats(
  departureId: string,
  numPeople: number,
): Promise<boolean> {
  return updateBookedSeats(departureId, numPeople);
}

export async function decrementBookedSeats(
  departureId: string,
  numPeople: number,
): Promise<void> {
  const success = await updateBookedSeats(departureId, -numPeople);
  if (!success) {
    throw new Error(`Failed to release ${numPeople} seats - would result in negative count`);
  }
}
