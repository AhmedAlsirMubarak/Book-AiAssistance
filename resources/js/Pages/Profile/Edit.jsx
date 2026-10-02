import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-200/70">Account</p>
                    <h1 className="mt-1 font-serif text-4xl text-white sm:text-5xl">Your profile</h1>
                </div>
            }
        >
            <Head title="Profile" />

            <div className="mx-auto max-w-[83rem] space-y-5 px-3 pb-16 pt-6 sm:px-6">
                <div className="glass rounded-[1.75rem] p-5 sm:p-8">
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        className="max-w-xl"
                    />
                </div>

                <div className="glass rounded-[1.75rem] p-5 sm:p-8">
                    <UpdatePasswordForm className="max-w-xl" />
                </div>

                <div className="glass rounded-[1.75rem] p-5 sm:p-8">
                    <DeleteUserForm className="max-w-xl" />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
