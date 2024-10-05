"use client";

import Sidebar from '@/app/components/sidebar';
import TopBar from '@/app/components/topbar';
import Input from '@/app/components/input';
import Button from '@/app/components/button';
import React, { useState } from 'react';

export default function Account() {
    const [firstName, setFirstName] = useState("Jinil");
    const [lastName, setLastName] = useState("Parekh");
    const [email, setEmail] = useState("parekhjinil@gmail.com");

    const handleUpdate = () => {
        const updatedAccountInfo = {
            firstName,
            lastName,
            email
        };
        console.log("Updated account info:", updatedAccountInfo);

    };

    const handleCancel = () => {
        console.log("Changes cancelled");

    };

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <TopBar />
                <div className="flex-grow overflow-auto p-8 flex">
                    <div className="w-1/2 rounded-lg p-8 ml-0">
                        <h1 className="text-2xl font-semibold mb-4">Account</h1>

                        {/* {error.apiError && <ApiError errorMessage={error.apiError} />} */}
                        <div className="flex gap-4 mb-6">
                            <div className="w-1/2">
                                <Input
                                    label="First Name"
                                    hasLabel={true}
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full"
                                    disabled={false}
                                    hasError={false}
                                    error=""
                                    hasHelperText={false}
                                    helperText=""
                                />
                            </div>
                            <div className="w-1/2">
                                <Input
                                    label="Last Name"
                                    hasLabel={true}
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-full"
                                    disabled={false}
                                    hasError={false}
                                    error=""
                                    hasHelperText={false}
                                    helperText=""
                                />
                            </div>
                        </div>


                        <div className="w-full mb-6">
                            <Input
                                label="Email"
                                hasLabel={true}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full"
                                disabled={false}
                                hasError={false}
                                error=""
                                hasHelperText={false}
                                helperText=""
                            />
                        </div>


                        <div className="flex justify-between">
                            <Button
                                buttonText="Cancel"
                                buttonClassName="bg-gray-300 text-black rounded-lg hover:bg-gray-400 w-1/2 py-3 flex justify-center items-center text-center"
                                onClick={handleCancel}
                            />
                            <Button
                                buttonText="Update"
                                buttonClassName="bg-gray-600 text-white rounded-lg hover:bg-gray-700 w-1/2 py-3 flex justify-center items-center text-center ml-4"
                                onClick={handleUpdate}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

