import { redirect } from 'next/navigation';

export default function BusinessDashboardRedirectPage() {
  redirect('/business/profile');
}
