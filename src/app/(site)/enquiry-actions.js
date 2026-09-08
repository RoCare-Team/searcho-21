"use server";
import { saveEnquiry } from "@/lib/enquiry";

/** Server action behind the "Submit your Request" popup. */
export async function submitRequestAction(_prev, formData) {
  return saveEnquiry({
    name: formData.get("name"),
    mobile: formData.get("mobile"),
    email: formData.get("email"),
    categoryId: formData.get("categoryId"),
    pincode: formData.get("pincode"),
    state: formData.get("state"),
    city: formData.get("city"),
    workType: formData.get("workType"),
    house: formData.get("house"),
    road: formData.get("road"),
    landmark: formData.get("landmark"),
  });
}
